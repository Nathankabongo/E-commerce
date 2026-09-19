import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth';
import {
  getProduct,
  getOfficialPrice,
  MAX_QUANTITY_PER_ITEM,
  MAX_ITEMS_IN_ORDER,
} from '@/lib/products';

// ─── Base de données en mémoire (mock) ────────────────────────────────────────
let orders: any[] = [];

// ─── GET /api/orders — Historique des commandes de l'utilisateur ──────────────
export async function GET(req: NextRequest) {
  // 1. Vérifier l'authentification via JWT (signature cryptographique)
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const payload = await verifyJwtToken(token);
  if (!payload || !payload.email) {
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
  }

  // 2. Filtrer UNIQUEMENT les commandes de cet utilisateur
  const userOrders = orders
    .filter((o) => o.userEmail === payload.email)
    .sort((a, b) => b.date - a.date);

  return NextResponse.json({ orders: userOrders });
}

// ─── POST /api/orders — Créer une commande ────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── 1. Authentification ─────────────────────────────────────────────────────
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const payload = await verifyJwtToken(token);
  if (!payload || !payload.email) {
    return NextResponse.json({ error: 'Session invalide ou expirée.' }, { status: 401 });
  }

  // ── 2. Protection CSRF ──────────────────────────────────────────────────────
  const csrfTokenHeader = req.headers.get('x-csrf-token');
  const csrfCookie = req.cookies.get('csrf_token')?.value;

  if (!csrfCookie || !csrfTokenHeader || csrfTokenHeader !== csrfCookie) {
    return NextResponse.json({ error: 'Erreur CSRF. Action non autorisée.' }, { status: 403 });
  }

  // ── 3. Lecture et validation basique du body ─────────────────────────────────
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête JSON invalide.' }, { status: 400 });
  }

  const { items, paymentMethod } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Le panier est vide.' }, { status: 400 });
  }

  if (items.length > MAX_ITEMS_IN_ORDER) {
    return NextResponse.json(
      { error: `Trop d'articles (max ${MAX_ITEMS_IN_ORDER}).` },
      { status: 400 },
    );
  }

  // ── 4. ✅ RECALCUL DES PRIX CÔTÉ SERVEUR ─────────────────────────────────────
  //
  //   ❌ AVANT (vulnérable — montrée dans Burp Suite) :
  //      const total = body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  //      → L'attaquant met "price":0 dans Burp → commande gratuite !
  //
  //   ✅ APRÈS (sécurisé) :
  //      On ignore COMPLÈTEMENT item.price du client.
  //      On utilise UNIQUEMENT les prix de PRODUCT_CATALOG (source serveur).
  //
  const verifiedItems: any[] = [];
  let total = 0;

  for (const item of items) {
    // Valider que l'ID est un entier
    const productId = parseInt(item.id, 10);
    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { error: `Produit invalide : id "${item.id}"` },
        { status: 400 },
      );
    }

    // Valider que le produit existe dans le catalogue officiel
    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json(
        { error: `Produit inconnu : id ${productId}` },
        { status: 400 },
      );
    }

    // Valider la quantité (entier positif, ≤ max)
    const quantity = parseInt(item.quantity, 10);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      return NextResponse.json(
        { error: `Quantité invalide pour "${product.name}" (1–${MAX_QUANTITY_PER_ITEM}).` },
        { status: 400 },
      );
    }

    // ✅ Prix officiel depuis le serveur — jamais depuis le client
    const officialPrice = getOfficialPrice(productId)!;
    const lineTotal = officialPrice * quantity;
    total += lineTotal;

    verifiedItems.push({
      id: product.id,
      name: product.name,
      image: product.image,
      // ✅ On stocke le prix officiel, pas celui du client
      price: officialPrice,
      quantity,
      lineTotal,
    });

    // Log de sécurité : détecter les tentatives de manipulation
    if (item.price !== undefined && Number(item.price) !== officialPrice) {
      console.warn(
        `[SECURITY] Tentative de manipulation de prix détectée !
         Utilisateur : ${payload.email}
         Produit     : "${product.name}" (id=${productId})
         Prix client : ${item.price}  ← manipulé
         Prix réel   : ${officialPrice} FC  ← appliqué`,
      );
    }
  }

  // ── 5. Valider le mode de paiement ──────────────────────────────────────────
  const allowedPaymentMethods = [
    'Carte Bancaire',
    'Mobile Money (M-Pesa)',
    'Mobile Money (Airtel)',
    'Crypto (Bitcoin/USDT)',
  ];
  const safePaymentMethod = allowedPaymentMethods.includes(paymentMethod)
    ? paymentMethod
    : 'Carte Bancaire';

  // ── 6. Créer la commande avec le total vérifié ───────────────────────────────
  const newOrder = {
    id: 'CMD-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    userEmail: payload.email,   // depuis le JWT (non falsifiable)
    items: verifiedItems,       // prix recalculés côté serveur
    total,                      // total officiel, jamais celui du client
    paymentMethod: safePaymentMethod,
    date: Date.now(),
    status: 'En cours de préparation',
    deliveryDays: Math.floor(Math.random() * 3) + 2,
  };

  orders.push(newOrder);

  console.log(
    `[ORDER] Commande ${newOrder.id} créée pour ${payload.email} — Total : ${total.toLocaleString('fr-CD')} FC`,
  );

  return NextResponse.json({ order: newOrder }, { status: 201 });
}

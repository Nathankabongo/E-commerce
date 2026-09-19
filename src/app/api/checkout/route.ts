import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth';
import { getProduct, getOfficialPrice, MAX_QUANTITY_PER_ITEM } from '@/lib/products';

// ─── POST /api/checkout ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé. Veuillez vous connecter.' }, { status: 401 });
    }

    const payload = await verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Session invalide ou expirée.' }, { status: 401 });
    }

    // 2. Validation des entrées
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide ou invalide.' }, { status: 400 });
    }

    // 3. ✅ Recalcul des prix depuis le catalogue serveur
    //    Même logique que orders/route.ts — le client ne peut pas truquer le total
    let total = 0;
    for (const item of items) {
      const productId = parseInt(item.id, 10);
      const product = getProduct(productId);
      if (!product) {
        return NextResponse.json({ error: `Produit inconnu : id ${productId}` }, { status: 400 });
      }
      const quantity = Math.max(1, Math.min(parseInt(item.quantity, 10) || 1, MAX_QUANTITY_PER_ITEM));
      total += getOfficialPrice(productId)! * quantity;
    }

    const order = {
      orderId: 'CMD-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      user: payload.email || payload.name,
      total,
      date: new Date().toISOString(),
      status: 'Validation Sécurisée',
    };

    console.log('[SECURITY] Commande traitée pour:', order.user, 'Total:', order.total);

    return NextResponse.json({
      success: true,
      message: 'Commande traitée avec succès de manière sécurisée.',
      orderId: order.orderId,
    });
  } catch (error) {
    console.error('[SECURITY ERROR] Erreur lors du checkout:', error);
    return NextResponse.json(
      { error: 'Une erreur interne s\'est produite lors du paiement.' },
      { status: 500 },
    );
  }
}

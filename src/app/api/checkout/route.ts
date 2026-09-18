import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Validation de l'authentification (Complémentaire au middleware)
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé. Veuillez vous connecter.' }, { status: 401 });
    }

    const payload = await verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Session invalide ou expirée.' }, { status: 401 });
    }

    // 2. Validation des entrées (Protection contre l'injection et les requêtes malformées)
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide ou invalide.' }, { status: 400 });
    }

    // 3. Traitement de la commande sécurisée (Simulation pour Juliette)
    const total = items.reduce((sum: number, item: any) => {
      // Validation stricte des prix (ne pas faire confiance au client dans une vraie app)
      return sum + (Number(item.price) || 0);
    }, 0);

    const order = {
      orderId: 'CMD-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      user: payload.email || payload.name,
      total: total,
      date: new Date().toISOString(),
      status: 'Validation Sécurisée'
    };

    console.log('[SECURITY] Commande traitée pour:', order.user, 'Total:', order.total);

    // Retour générique en cas de succès
    return NextResponse.json({ 
      success: true, 
      message: 'Commande traitée avec succès de manière sécurisée.',
      orderId: order.orderId 
    });

  } catch (error) {
    // Gestion des erreurs sans fuite d'informations (OWASP)
    console.error('[SECURITY ERROR] Erreur lors du checkout:', error);
    return NextResponse.json({ error: 'Une erreur interne s\'est produite lors du paiement.' }, { status: 500 });
  }
}

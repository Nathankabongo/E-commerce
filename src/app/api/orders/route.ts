import { NextRequest, NextResponse } from 'next/server';

// Mock in-memory database for orders
let orders: any[] = [];

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // Parse token to get user email (simplified mock logic)
  let userEmail = '';
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('ascii'));
    userEmail = payload.email;
  } catch (e) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  const userOrders = orders.filter(o => o.userEmail === userEmail).sort((a, b) => b.date - a.date);
  return NextResponse.json({ orders: userOrders });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const csrfTokenHeader = req.headers.get('x-csrf-token');
  const csrfCookie = req.cookies.get('csrf_token')?.value;

  if (!csrfCookie || csrfTokenHeader !== csrfCookie) {
    return NextResponse.json({ error: 'Erreur CSRF. Action non autorisée.' }, { status: 403 });
  }

  let userEmail = '';
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('ascii'));
    userEmail = payload.email;
  } catch (e) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  const body = await req.json();
  
  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 });
  }

  const total = body.items.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
  
  const newOrder = {
    id: Math.random().toString(36).substring(2, 9),
    userEmail,
    items: body.items,
    total,
    paymentMethod: body.paymentMethod || 'Carte Bancaire',
    date: Date.now(),
    status: 'En cours de préparation',
    deliveryDays: Math.floor(Math.random() * 3) + 2 // 2 to 4 days
  };

  orders.push(newOrder);

  return NextResponse.json({ order: newOrder }, { status: 201 });
}

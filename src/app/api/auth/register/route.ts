import { NextRequest, NextResponse } from 'next/server';
import { signJwtToken } from '@/lib/auth';
import { users } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Champs invalides' }, { status: 400 });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 400 });
    }

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      password // Dans une vraie application, hacher le mot de passe avec bcrypt/argon2
    };

    users.push(newUser);

    const token = await signJwtToken({ id: newUser.id, name: newUser.name, email: newUser.email });

    const response = NextResponse.json({ success: true, user: { name: newUser.name, email: newUser.email } }, { status: 201 });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 });
  }
}

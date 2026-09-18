import { NextRequest, NextResponse } from 'next/server';
import { signJwtToken } from '@/lib/auth';
import { users } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate input (prevent injection, minimal required)
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const token = await signJwtToken({ id: user.id, name: user.name, email });
      
      const response = NextResponse.json({ success: true, user: { name: user.name, email } });
      
      // Setting Secure, HttpOnly, SameSite cookies
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true on HTTPS
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });
      
      return response;
    }
    
    // Generic error message to prevent enumeration
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

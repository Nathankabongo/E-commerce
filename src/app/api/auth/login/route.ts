import { NextRequest, NextResponse } from 'next/server';
import { signJwtToken } from '@/lib/auth';

const MOCK_USER = {
  email: 'demo@example.com',
  password: 'Password123!', // Do not store plain text in real app
  id: 'usr_123',
  name: 'Demo User'
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate input (prevent injection, minimal required)
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      const token = await signJwtToken({ id: MOCK_USER.id, name: MOCK_USER.name, email });
      
      const response = NextResponse.json({ success: true, user: { name: MOCK_USER.name, email } });
      
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

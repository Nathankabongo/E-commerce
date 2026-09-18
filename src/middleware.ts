import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;"
  );

  // Auth Validation for protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/checkout') || request.nextUrl.pathname.startsWith('/api/protected');
  const token = request.cookies.get('token')?.value;

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const verifiedToken = await verifyJwtToken(token);
    if (!verifiedToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // CSRF validation for mutating API routes
  if (request.method !== 'GET' && request.nextUrl.pathname.startsWith('/api/')) {
    // allow login/logout without CSRF for simplicity, or check it everywhere.
    // Real implementation should check csrf for all state-changing ops.
    const csrfTokenHeader = request.headers.get('x-csrf-token');
    const csrfCookie = request.cookies.get('csrf_token')?.value;
    
    if (request.nextUrl.pathname !== '/api/auth/login' && request.nextUrl.pathname !== '/api/auth/logout') {
      if (!csrfTokenHeader || !csrfCookie || csrfTokenHeader !== csrfCookie) {
        return new NextResponse(JSON.stringify({ error: 'Invalid CSRF token' }), { status: 403 });
      }
    }
  }

  // Ensure CSRF cookie exists
  if (!request.cookies.has('csrf_token')) {
    const newCsrf = crypto.randomUUID();
    response.cookies.set({
      name: 'csrf_token',
      value: newCsrf,
      httpOnly: false, // Must be readable by client script to send in header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

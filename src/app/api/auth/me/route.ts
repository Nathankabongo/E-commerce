import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }
  
  const payload = await verifyJwtToken(token);
  if (!payload) {
    return NextResponse.json({ user: null });
  }
  
  return NextResponse.json({ user: { name: payload.name, email: payload.email } });
}

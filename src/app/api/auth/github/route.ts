import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`;
  
  if (!clientId || clientId === 'mock_client_id') {
    // Mode simulation pour la démo universitaire s'ils n'ont pas configuré de vraie App GitHub
    const mockCode = 'mock_oauth_code_12345';
    return NextResponse.redirect(`${redirectUri}?code=${mockCode}`);
  }

  // Flux OAuth 2.0 Réel
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
  return NextResponse.redirect(githubAuthUrl);
}

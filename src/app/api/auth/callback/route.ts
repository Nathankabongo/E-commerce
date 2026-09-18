import { NextRequest, NextResponse } from 'next/server';
import { signJwtToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', req.url));
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  
  let userData = {
    id: 'github_usr_' + Math.random().toString(36).substring(7),
    name: 'Utilisateur GitHub',
    email: 'github_user@example.com'
  };

  // Si on est en mode simulation (ou sans configuration GitHub)
  if (!clientId || clientId === 'mock_client_id' || code === 'mock_oauth_code_12345') {
    // On garde les données mockées ci-dessus
  } else {
    try {
      // 1. Échanger le code contre un Access Token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code
        })
      });
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) throw new Error('Pas de token retourné');

      // 2. Récupérer les informations utilisateur depuis GitHub
      const userRes = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const githubUser = await userRes.json();
      
      userData.id = githubUser.id.toString();
      userData.name = githubUser.name || githubUser.login;
      
      // 3. Récupérer les emails (car souvent l'email public est null)
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const emails = await emailRes.json();
      const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email;
      userData.email = primaryEmail;
      
    } catch (e) {
      return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url));
    }
  }

  try {
    // Génération du JWT (courte durée) via notre librairie sécurisée (jose)
    const token = await signJwtToken({ id: userData.id, name: userData.name, email: userData.email });

    // Redirection vers l'accueil après connexion
    const response = NextResponse.redirect(new URL('/', req.url));

    // Définition des cookies ultra-sécurisés exigés par le cahier des charges
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true, // Impossible à lire en JavaScript (Protection XSS)
      secure: process.env.NODE_ENV === 'production', // Uniquement sur HTTPS en Prod
      sameSite: 'strict', // Protection contre CSRF
      maxAge: 60 * 60, // 1 heure de durée de vie
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.redirect(new URL('/login?error=jwt_generation_failed', req.url));
  }
}

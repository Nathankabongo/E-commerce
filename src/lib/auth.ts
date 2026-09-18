import { jwtVerify, SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';

export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'default_secure_ecommerce_jwt_secret_key_2026_x89f';
  return new TextEncoder().encode(secret);
};

export async function verifyJwtToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch (error) {
    return null;
  }
}

export async function signJwtToken(payload: any) {
  const secret = getJwtSecretKey();
  const alg = 'HS256';
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('1h') // Short-lived token
    .sign(secret);
}

export function generateCsrfToken() {
  return uuidv4();
}

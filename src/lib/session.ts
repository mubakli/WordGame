import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
  userId: string;
  username: string;
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedSecret);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedSecret, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string, username: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, username });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function verifySession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  if (!sessionCookie) {
    return null;
  }

  const payload = await decrypt(sessionCookie);
  if (!payload?.userId) {
    return null;
  }

  return payload;
}

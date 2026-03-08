import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/session';

// Add the routes you want to protect here
const protectedRoutes = ['/manage'];
const publicRoutes = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // Api routes protection
  const isApiRoute = path.startsWith('/api/');
  const isAuthApi = path.startsWith('/api/auth');

  // Verify the session
  const session = await verifySession();

  // 1. Redirect unauthenticated users navigating to protected pages to /login
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // 2. Redirect authenticated users navigating to login/register to /manage
  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL('/manage', req.nextUrl));
  }

  // 3. Protect all APIs except /api/auth
  if (isApiRoute && !isAuthApi && !session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)', '/api/:path*'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('phisherman_token')?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/dashboard', '/scanner', '/history', '/threats', '/settings'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/scanner/:path*', '/history/:path*', '/threats/:path*', '/settings/:path*'],
};

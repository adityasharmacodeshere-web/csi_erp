import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/dashboard', '/library', '/sports', '/laundry', '/mess'];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    const sessionCookie = request.cookies.get('bennett_erp_session');
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/library/:path*', '/sports/:path*', '/laundry/:path*', '/mess/:path*'],
};

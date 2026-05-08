import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production-32chars'
);

const protectedRoutes = ['/user', '/admin'];
const artistProtectedRoutes = ['/artist/dashboard', '/artist/catalog', '/artist/profile'];
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('ngowamix_session')?.value;
  const pathname = request.nextUrl.pathname;

  let userRole: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userRole = payload.role as string;
    } catch {
      userRole = null;
    }
  }

  if (authRoutes.includes(pathname) && userRole) {
    return NextResponse.redirect(new URL('/user/dashboard', request.url));
  }

  const isArtistProtected = artistProtectedRoutes.some((route) => pathname.startsWith(route));

  if (isArtistProtected) {
    if (!userRole) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
      );
    }

    if (!['ARTIST', 'LABEL', 'ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!userRole) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
      );
    }

    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/user/:path*', '/artist/:path*', '/admin/:path*', '/login', '/register'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Route classification ─────────────────────────────────────────────────────

/** Paths that require authentication */
const PROTECTED_PATHS = ['/dashboard', '/bookings', '/profile'];

/** Auth pages — redirect to dashboard when already logged in */
const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/reset-password'];

// ─── Middleware ───────────────────────────────────────────────────────────────
// Next.js requires this file to be named middleware.ts and the export
// to be named "middleware" (or a default export).

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /**
   * Auth check strategy:
   * The backend sets an httpOnly `refreshToken` cookie on login/register.
   * We cannot read Zustand state (localStorage) from the Edge runtime, so we
   * use the presence of this cookie as the server-side session signal.
   */
  const hasSession = request.cookies.has('refreshToken');

  // 1. Protect private routes
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect already-authenticated users away from auth pages
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};

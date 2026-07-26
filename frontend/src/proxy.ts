import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ─── Next.js 16 Proxy (Edge Middleware) ──────────────────────────────────────
 *
 * WHY WE DON'T DO AUTH REDIRECTS HERE:
 *
 * The refreshToken cookie is set by the Render backend (e.g. your-app.onrender.com).
 * Vercel's Edge runtime can only read cookies that were set for the SAME domain
 * (rentease-xxx.vercel.app). Cross-domain httpOnly cookies from a different origin
 * are NEVER forwarded in the incoming request — so request.cookies.get('refreshToken')
 * always returns undefined in production, causing every authenticated user to be
 * incorrectly redirected to /login.
 *
 * AUTH GUARD STRATEGY (production-safe):
 *  - Client-side: AuthLayout (redirects logged-in users away from /login, /signup)
 *  - Client-side: DashboardLayout (redirects logged-out users to /login)
 *  - Both use Zustand authStore + _hasHydrated to prevent flash of wrong content.
 *
 * This proxy is kept for future use (e.g., geolocation headers, A/B tests, etc.)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

// Only run on routes that actually need edge processing (not static assets)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};


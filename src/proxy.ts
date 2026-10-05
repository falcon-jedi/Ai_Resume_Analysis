import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/app/api/(controller)/_util/rate-limit/rate-limit';

/**
 * Next.js Middleware — runs on EVERY request before the route handler.
 *
 * Responsibilities:
 * 1. Protect authenticated routes (/app/*)
 * 2. Protect private API routes (/api/resume/*, /api/ats/*, etc.)
 * 3. Redirect authenticated users away from login/signup pages
 * 4. Allow public routes through
 *
 * HOW IT WORKS:
 * - Reads the JWT from the HTTP-only cookie (set by Auth.js)
 * - If valid → request proceeds
 * - If invalid or missing → redirect to login (pages) or 401 (APIs)
 *
 * SECURITY:
 * - getToken() verifies the JWT signature using NEXTAUTH_SECRET
 * - The cookie is HTTP-only, so JavaScript cannot read or forge it
 * - SameSite=Lax prevents CSRF from third-party sites
 */

// Routes that DON'T require authentication
const publicPaths = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/app/login',
  '/app/signup',
  '/app/ats-checker',
  '/app/templates',
  '/app/pricing',
  '/app/features',
  '/app/resources',
  '/app/about',
  '/app/contact',
  '/app/privacy',
  '/app/terms',
  '/verify-email',
  '/app/forgot-password',
  '/app/reset-password',
];

// API paths that DON'T require authentication
const publicApiPrefixes = ['/api/auth', '/api/public', '/api/webhooks', '/api/feedback'];

// API paths that DO require authentication
const protectedApiPrefixes = [
  '/api/resume',
  '/api/ats',
  '/api/ats-checker',
  '/api/upload',
  '/api/subscription',
  '/api/ai',
];

function isPublicPage(pathname: string): boolean {
  return publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isPublicApi(pathname: string): boolean {
  return publicApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedApi(pathname: string): boolean {
  return protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isAppRoute(pathname: string): boolean {
  return pathname.startsWith('/app');
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. RATE LIMITING (centralized via @upstash/ratelimit)
  const limited = await checkRateLimit(request);
  if (limited) return limited;

  // Get JWT token from cookie
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // Direct friendly shortcuts (/about -> /app/about, /contact -> /app/contact, /privacy -> /app/privacy, /terms -> /app/terms)
  if (
    pathname === '/about' ||
    pathname === '/contact' ||
    pathname === '/privacy' ||
    pathname === '/terms'
  ) {
    const directUrl = request.nextUrl.clone();
    directUrl.pathname = `/app${pathname}`;
    return NextResponse.redirect(directUrl);
  }

  // Legacy paths from older reset emails
  if (pathname === '/reset-password' || pathname === '/forgot-password') {
    const legacyUrl = request.nextUrl.clone();
    legacyUrl.pathname =
      pathname === '/reset-password' ? '/app/reset-password' : '/app/forgot-password';
    return NextResponse.redirect(legacyUrl);
  }

  // 1. ADMIN ROUTES → require ADMIN role
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/app/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/app/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. PUBLIC API routes → always allow

  if (isPublicApi(pathname)) {
    return NextResponse.next();
  }

  // 3. PROTECTED API routes → require auth

  if (isProtectedApi(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 4. AUTH PAGES → redirect away if already logged in
  //    Admins → /admin, regular users → /app/dashboard

  if (
    pathname === '/app/login' ||
    pathname === '/app/signup' ||
    pathname === '/app/forgot-password' ||
    pathname === '/app/reset-password'
  ) {
    if (isAuthenticated) {
      const dest = token?.role === 'ADMIN' ? '/admin' : '/app/dashboard';
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  // 5. PUBLIC PAGES → always allow

  if (isPublicPage(pathname)) {
    return NextResponse.next();
  }

  // 6. APP PAGES → require auth

  if (isAppRoute(pathname)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/app/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 7. Everything else → allow (static files, etc.)
  return NextResponse.next();
}

/**
 * Matcher config — tells Next.js which paths this middleware applies to.
 * Excludes static assets and Next.js internals for performance.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

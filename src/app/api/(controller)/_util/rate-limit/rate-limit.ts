import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Upstash-backed rate limiter for JobPatra API routes.
 *
 * - When UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are absent
 *   (local dev without .env.local configured), redis is null and
 *   checkRateLimit is a no-op — local dev is never blocked.
 * - On Redis outage: fails open (logs the error, allows the request).
 * - Webhooks, cron, and health routes are always skipped.
 */

// ── Redis client ────────────────────────────────────────────────────────────

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// ── Limiter factory ─────────────────────────────────────────────────────────

function makeLimiter(
  tokens: number,
  window: `${number} ${'s' | 'm' | 'h'}`,
  prefix: string,
): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: true,
    prefix: `jobpatra:rl:${prefix}`,
  });
}

// ── Per-tier limiter instances ──────────────────────────────────────────────

const limiters = {
  // AI / compute (cost-sensitive) — use userId as identifier
  atsAnalyze: makeLimiter(10, '1 m', 'ats-analyze'),
  extractJd: makeLimiter(8, '1 m', 'extract-jd'),
  aiImprove: makeLimiter(10, '1 m', 'ai-improve'),
  pdf: makeLimiter(6, '1 m', 'pdf'),

  // Auth (brute-force protection) — use IP as identifier
  authSession: makeLimiter(60, '1 m', 'auth-session'), // page-load endpoint; generous, no ban
  auth: makeLimiter(15, '1 m', 'auth'),

  // Public auth flows — use IP as identifier
  signup: makeLimiter(5, '1 m', 'signup'),
  forgotPassword: makeLimiter(3, '5 m', 'forgot-password'),
  resetPassword: makeLimiter(5, '5 m', 'reset-password'),
  verifyEmail: makeLimiter(10, '5 m', 'verify-email'),

  // User interactions — use IP (unauth) or userId (auth)
  feedback: makeLimiter(5, '5 m', 'feedback'),
  upload: makeLimiter(15, '1 m', 'upload'),

  // Global fallback
  global: makeLimiter(120, '1 m', 'global'),
} satisfies Record<string, Ratelimit | null>;

type LimiterKey = keyof typeof limiters;

// ── Ban TTL config (seconds) — only for security-sensitive endpoints ─────────
// After exceeding the window limit, the IP is banned for this duration even
// after the sliding window would have reset. Mirrors the old shield `block`.

const banSeconds: Partial<Record<LimiterKey, number>> = {
  atsAnalyze: 30 * 60, // 30 min — AI cost protection
  aiImprove: 30 * 60,
  auth: 15 * 60,
  signup: 30 * 60,
  forgotPassword: 30 * 60,
  resetPassword: 30 * 60,
  verifyEmail: 15 * 60,
  feedback: 15 * 60,
};

// ── Route rules (first match wins — most specific first) ────────────────────

type RouteRule =
  | { pattern: RegExp; skip: true }
  | { pattern: RegExp; skip?: false; key: LimiterKey; useUserId?: boolean };

const routeRules: RouteRule[] = [
  // Always bypass — these routes have their own security mechanisms
  { pattern: /^\/api\/webhooks\//, skip: true },
  { pattern: /^\/api\/cron\//, skip: true },
  { pattern: /^\/api\/public\/health$/, skip: true },

  // AI / compute — per user to prevent IP-rotation bypass
  { pattern: /^\/api\/ats\/analyze$/, key: 'atsAnalyze', useUserId: true },
  { pattern: /^\/api\/ats\/extract-jd$/, key: 'extractJd', useUserId: true },
  { pattern: /^\/api\/resume\/ai-improve$/, key: 'aiImprove', useUserId: true },
  { pattern: /^\/api\/resume\/[^/]+\/pdf$/, key: 'pdf', useUserId: true },

  // Auth helpers — NextAuth's internal plumbing; must NEVER be rate-limited or
  // NextAuth breaks and redirects to /api/auth/error with a raw 429 page.
  { pattern: /^\/api\/auth\/session$/, skip: true },
  { pattern: /^\/api\/auth\/providers$/, skip: true },
  { pattern: /^\/api\/auth\/csrf$/, skip: true },
  { pattern: /^\/api\/auth\/error$/, skip: true },
  { pattern: /^\/api\/auth\/signout$/, skip: true },
  { pattern: /^\/api\/auth\/_log$/, skip: true },

  // Actual credential sign-in attempts — this is the only brute-force target.
  // OAuth flows (/api/auth/signin/google, etc.) are intentionally excluded:
  // they redirect to the provider and carry no password to brute-force.
  { pattern: /^\/api\/auth\/callback\/credentials$/, key: 'auth' },

  // Public auth flows — per IP
  { pattern: /^\/api\/public\/signup$/, key: 'signup' },
  { pattern: /^\/api\/public\/auth\/forgot-password$/, key: 'forgotPassword' },
  { pattern: /^\/api\/public\/auth\/reset-password$/, key: 'resetPassword' },
  { pattern: /^\/api\/public\/auth\/verify-email$/, key: 'verifyEmail' },

  // User interactions
  { pattern: /^\/api\/feedback$/, key: 'feedback' },
  { pattern: /^\/api\/upload\/resume-photo$/, key: 'upload', useUserId: true },
];

// ── IP extraction ───────────────────────────────────────────────────────────

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

// ── Rate limit with optional ban ────────────────────────────────────────────

async function limitWithOptionalBan(
  key: LimiterKey,
  identifier: string,
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiter = limiters[key];
  const ban = banSeconds[key];

  // No Redis / limiter not configured — always allow
  if (!limiter || !redis) return { success: true, limit: 0, remaining: 0, reset: 0 };

  // Check active ban first (1 Redis GET)
  if (ban) {
    const banKey = `jobpatra:ban:${key}:${identifier}`;
    const banned = await redis.get(banKey);
    if (banned) {
      return { success: false, limit: 0, remaining: 0, reset: Date.now() + ban * 1000 };
    }
  }

  // Check sliding window (1 Redis ZADD+ZCOUNT)
  const result = await limiter.limit(identifier);

  // Set ban key on first violation
  if (!result.success && ban) {
    const banKey = `jobpatra:ban:${key}:${identifier}`;
    await redis.set(banKey, 1, { ex: ban });
  }

  return result;
}

// ── Main export ─────────────────────────────────────────────────────────────

/**
 * Check rate limit for the incoming request.
 * Returns null when the request is allowed; returns a NextResponse 429 when blocked.
 * Returns null for non-API paths and skipped routes without any Redis calls.
 */
export async function checkRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith('/api')) return null;

  // Match route rule
  const rule = routeRules.find((r) => r.pattern.test(pathname));
  if (rule?.skip) return null;

  const key: LimiterKey = rule && !rule.skip ? rule.key : 'global';
  const useUserId = rule && !rule.skip ? (rule.useUserId ?? false) : false;

  // Resolve identifier — prefer userId for authenticated routes when requested
  let identifier = getClientIp(request);
  if (useUserId) {
    try {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (token?.sub) identifier = token.sub;
    } catch {
      // Fall back to IP if JWT decode fails
    }
  }

  try {
    const { success, limit, remaining, reset } = await limitWithOptionalBan(key, identifier);
    if (success) return null;

    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return NextResponse.json(
      {
        success: false,
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please retry after ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(retryAfter),
        },
      },
    );
  } catch (err) {
    // Fail open — a Redis blip should never take down the whole API
    console.error('[rate-limit] Upstash error, failing open:', err);
    return null;
  }
}

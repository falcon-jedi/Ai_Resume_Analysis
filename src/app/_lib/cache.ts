/**
 * Cache-aside helpers built on top of the Upstash Redis singleton.
 *
 * Design principles:
 *  - Redis is a performance layer. If it is down, all functions fall through
 *    to the provided fetcher and the app continues working normally.
 *  - Keys are namespaced with environment so dev/staging/prod never share data.
 *  - All errors are logged but never re-thrown — cache failures are silent.
 *
 * Server-side only. Never import from client components.
 */

import { redis } from './redis';

const ENV = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

// ── Key builder ──────────────────────────────────────────────────────────────

/**
 * Build a namespaced Redis key.
 *
 * Format: `jobpatra:{env}:{namespace}:{...parts}`
 *
 * Examples:
 *   buildKey('cache', 'pricing')              → jobpatra:prod:cache:pricing
 *   buildKey('cache', 'plan-limits', 'pro')   → jobpatra:prod:cache:plan-limits:pro
 */
export function buildKey(namespace: string, ...parts: string[]): string {
  return ['jobpatra', ENV, namespace, ...parts].join(':');
}

// ── Cache-aside ──────────────────────────────────────────────────────────────

/**
 * Get a value from Redis, falling back to `fetcher()` on cache miss or error.
 * Automatically serialises/deserialises JSON.
 *
 * @param key        Full Redis key (use buildKey to construct it)
 * @param fetcher    Async function that fetches from the source of truth (DB)
 * @param ttlSeconds How long to cache the value (seconds)
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
): Promise<T> {
  if (!redis) {
    // No Redis configured (local dev without env vars) — go straight to DB
    return fetcher();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      if (typeof cached === 'string') {
        try {
          return JSON.parse(cached) as T;
        } catch {
          return cached as unknown as T;
        }
      }
      return cached;
    }
  } catch (err) {
    console.error(`[cache] Redis GET failed for key "${key}":`, err);
    // Fall through to fetcher
  }

  const value = await fetcher();

  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (err) {
    console.error(`[cache] Redis SET failed for key "${key}":`, err);
    // Non-fatal — value is returned from fetcher regardless
  }

  return value;
}

/**
 * Delete one or more keys from Redis (cache invalidation).
 * Silently swallows errors — a failed invalidation is not critical since
 * the TTL will eventually expire the key anyway.
 */
export async function invalidate(...keys: string[]): Promise<void> {
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch (err) {
    console.error(`[cache] Redis DEL failed for keys [${keys.join(', ')}]:`, err);
  }
}

/**
 * Delete all keys matching a pattern from Redis (wildcard cache invalidation).
 * Useful for purging entire namespaces dynamically, e.g. all plan-limit keys.
 */
export async function invalidatePattern(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error(`[cache] Redis KEYS/DEL failed for pattern "${pattern}":`, err);
  }
}

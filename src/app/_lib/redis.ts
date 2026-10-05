/**
 * Upstash Redis singleton for caching.
 *
 * This is separate from the rate-limit Redis instance (rate-limit.ts uses its
 * own private client). Keeping them separate isolates concerns — different key
 * prefixes, different failure modes, easier to swap one without touching the other.
 *
 * If UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are absent, redis is null
 * and all cache helpers silently fall through to the database. This means local
 * development works without Redis configured.
 *
 * Server-side only. Never import from client components.
 */

import { Redis } from '@upstash/redis';

export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

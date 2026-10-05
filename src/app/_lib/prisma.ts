import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dns from 'dns';
import { promisify } from 'util';

// Prevent multiple PrismaClient instances in development (hot reload).
// In production, a single instance is created and reused.

declare global {
  var __prisma: PrismaClient | undefined;
}

const resolve4 = promisify(dns.resolve4);

async function createPrismaClient() {
  // In development: DIRECT_URL (port 5432, session mode, bypasses PgBouncer).
  // In production: DATABASE_URL (port 6543, transaction pooler for serverless).
  const connectionString =
    process.env.NODE_ENV === 'development'
      ? (process.env.DIRECT_URL ?? process.env.DATABASE_URL)
      : process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL or DIRECT_URL is not set');
  }

  const u = new URL(connectionString);

  // Node.js resolves the hostname to BOTH IPv4 and IPv6, then races them
  // (Happy Eyeballs). The IPv6 addresses (64:ff9b::...) fail immediately
  // with ENETUNREACH, causing pg to report ETIMEDOUT even though IPv4 works.
  // Pre-resolving to a single IPv4 address sidesteps this entirely.
  const [resolvedHost] = await resolve4(u.hostname);

  const pool = new Pool({
    host: resolvedHost,
    port: parseInt(u.port || '5432'),
    user: u.username,
    password: u.password,
    database: u.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // The default 2-second wait is too short for a hosted, shared Postgres
    // pool when several page queries arrive together. Transactions themselves
    // remain short; this only gives the pool time to hand one out.
    transactionOptions: {
      maxWait: 10_000,
      timeout: 10_000,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE IMMUTABILITY MIDDLEWARE
// Prevents application code from ever updating the financial columns of an
// Invoice record once it has been created. pdfData and pdfUrl are exempt
// (set asynchronously by the cron job) — only the billing fields are locked.
// ─────────────────────────────────────────────────────────────────────────────

function applyMiddleware(client: PrismaClient): PrismaClient {
  return client.$extends({
    query: {
      invoice: {
        async update({ args, query }) {
          const IMMUTABLE_FIELDS = [
            'subtotal',
            'taxAmount',
            'total',
            'lineItems',
            'status',
            'invoiceNumber',
          ];
          const attempted = Object.keys(args.data ?? {});
          const blocked = attempted.filter((k) => IMMUTABLE_FIELDS.includes(k));
          if (blocked.length > 0) {
            throw new Error(
              `[Prisma] Invoice fields are immutable and cannot be updated: ${blocked.join(', ')}`,
            );
          }
          return query(args);
        },
        async updateMany({ args, query }) {
          const IMMUTABLE_FIELDS = [
            'subtotal',
            'taxAmount',
            'total',
            'lineItems',
            'status',
            'invoiceNumber',
          ];
          const attempted = Object.keys(args.data ?? {});
          const blocked = attempted.filter((k) => IMMUTABLE_FIELDS.includes(k));
          if (blocked.length > 0) {
            throw new Error(
              `[Prisma] Invoice fields are immutable and cannot be updated: ${blocked.join(', ')}`,
            );
          }
          return query(args);
        },
      },
    },
  }) as unknown as PrismaClient;
}

// Async IIFE to handle DNS resolution at module initialisation.
// The singleton is preserved across Next.js hot reloads via global.__prisma.
export const prisma: PrismaClient =
  global.__prisma ??
  (await (async () => {
    const client = await createPrismaClient();
    const extendedClient = applyMiddleware(client);
    if (process.env.NODE_ENV !== 'production') {
      global.__prisma = extendedClient;
    }
    return extendedClient;
  })());

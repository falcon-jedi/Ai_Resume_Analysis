/**
 * Admin seed script — pre-provisions admin accounts to prevent email squatting.
 *
 * Run: npm run db:seed
 * Requires: ADMIN_EMAILS, ADMIN_PASSWORD, and DIRECT_URL (or DATABASE_URL) in .env.local
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import dns from 'dns';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Simple .env parser — no dotenv dependency needed
function loadEnv(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(resolve(root, '.env'));

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌  DIRECT_URL or DATABASE_URL not set.');
  process.exit(1);
}

// Replicate the app's adapter-pg setup so Prisma 7 (client engine) works
const { PrismaClient } = await import('@prisma/client');
const { PrismaPg } = await import('@prisma/adapter-pg');
const { Pool } = await import('pg');
const { hash } = await import('bcryptjs');

const resolve4 = promisify(dns.resolve4);
const u = new URL(connectionString);
const [resolvedHost] = await resolve4(u.hostname);

const pool = new Pool({
  host: resolvedHost,
  port: parseInt(u.port || '5432'),
  user: u.username,
  password: u.password,
  database: u.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
  max: 2,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmails.length) {
    console.warn('⚠️  ADMIN_EMAILS is not set. No admin account will be created.');
    return;
  }
  if (!adminPassword) {
    console.error('❌  ADMIN_PASSWORD is not set.');
    process.exit(1);
  }
  if (adminPassword.length < 12) {
    console.error('❌  ADMIN_PASSWORD must be at least 12 characters.');
    process.exit(1);
  }

  console.log(`🌱 Seeding ${adminEmails.length} admin account(s)...`);
  const hashedPassword = await hash(adminPassword, 12);

  for (const email of adminEmails) {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (!existing) {
      await prisma.user.create({
        data: { email, password: hashedPassword, name: 'Admin', role: 'ADMIN' },
      });
      console.log(`✅  Created admin: ${email}`);
    } else if (existing.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          // Only set password if the account was OAuth-only (no password)
          ...(existing.password ? {} : { password: hashedPassword }),
        },
      });
      console.log(`✅  Promoted to ADMIN: ${email}`);
    } else {
      console.log(`ℹ️   Already ADMIN, skipped: ${email}`);
    }
  }

  console.log('🌱 Seeding complete.');
}

seed()
  .catch((e) => {
    console.error('❌  Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

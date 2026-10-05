#!/usr/bin/env node
/**
 * seed-templates.mjs
 *
 * Uploads all local template files (template.hbs, style.css, template.png,
 * metadata.json) to S3 under the templates/<id>/ prefix.
 *
 * Idempotent: skips files that already exist in S3 (HeadObject check).
 * Force re-upload: delete the S3 keys manually, then re-run.
 *
 * Run: npm run seed:templates
 * Requires: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_REGION in .env
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ── Load .env ────────────────────────────────────────────────────────────────
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

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: BUCKET,
  AWS_REGION: REGION,
} = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !BUCKET || !REGION) {
  console.error(
    '❌  Missing AWS env vars. Check AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_REGION.',
  );
  process.exit(1);
}

// ── S3 client (use AWS SDK v3 directly) ──────────────────────────────────────
const { S3Client, PutObjectCommand, HeadObjectCommand } = await import('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: REGION,
  credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
});

async function objectExists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function upload(key, body, contentType) {
  await s3.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }),
  );
}

// ── Content-type map ─────────────────────────────────────────────────────────
const CONTENT_TYPES = {
  'metadata.json': 'application/json',
  'template.hbs': 'text/plain',
  'style.css': 'text/css',
  'template.png': 'image/png',
  'template.jpg': 'image/jpeg',
};

const TEMPLATE_FILES = Object.keys(CONTENT_TYPES);

// ── Scan local templates dir ─────────────────────────────────────────────────
const TEMPLATES_DIR = resolve(root, 'src', 'templates');

if (!existsSync(TEMPLATES_DIR)) {
  console.error(`❌  Templates dir not found: ${TEMPLATES_DIR}`);
  process.exit(1);
}

/**
 * Returns array of { id, dir } for every template found.
 * Supports both flat (src/templates/<id>/) and
 * category (src/templates/<category>/<id>/) structures.
 */
function scanLocalTemplates() {
  const results = [];
  const topLevel = readdirSync(TEMPLATES_DIR, { withFileTypes: true }).filter((d) =>
    d.isDirectory(),
  );

  for (const entry of topLevel) {
    const entryPath = join(TEMPLATES_DIR, entry.name);
    const metaPath = join(entryPath, 'metadata.json');

    if (existsSync(metaPath)) {
      // Flat: src/templates/<id>/
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
      results.push({ id: meta.id || entry.name, dir: entryPath });
    } else {
      // Category: src/templates/<category>/<id>/
      const subDirs = readdirSync(entryPath, { withFileTypes: true }).filter((d) =>
        d.isDirectory(),
      );
      for (const sub of subDirs) {
        const subPath = join(entryPath, sub.name);
        const subMeta = join(subPath, 'metadata.json');
        if (existsSync(subMeta)) {
          const meta = JSON.parse(readFileSync(subMeta, 'utf-8'));
          results.push({ id: meta.id || sub.name, dir: subPath });
        }
      }
    }
  }
  return results;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function seedTemplates() {
  const templates = scanLocalTemplates();
  console.log(`🔍  Found ${templates.length} template(s) locally.\n`);

  let uploaded = 0;
  let skipped = 0;

  for (const { id, dir } of templates) {
    console.log(`📁  Template: ${id}`);

    for (const filename of TEMPLATE_FILES) {
      const localPath = join(dir, filename);
      if (!existsSync(localPath)) {
        console.log(`    ⚠️   ${filename} — not found locally, skipping`);
        continue;
      }

      const s3Key = `templates/${id}/${filename}`;
      const exists = await objectExists(s3Key);

      if (exists) {
        console.log(`    ⏭   ${filename} — already in S3, skipped`);
        skipped++;
        continue;
      }

      const body = readFileSync(localPath);
      const contentType = CONTENT_TYPES[filename] ?? 'application/octet-stream';
      await upload(s3Key, body, contentType);
      console.log(`    ✅  ${filename} — uploaded`);
      uploaded++;
    }

    console.log('');
  }

  console.log(`🌱  Done. ${uploaded} file(s) uploaded, ${skipped} skipped (already in S3).`);
}

seedTemplates().catch((e) => {
  console.error('❌  Seed failed:', e.message);
  process.exit(1);
});

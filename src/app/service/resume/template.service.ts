import path from 'path';
import fs from 'fs';
import { getObject, objectExists } from '@/app/service/storage/s3.service';
import type {
  Template,
  TemplatesResponse,
  TemplateMetadata,
  TemplateInfo,
} from '@/app/api/model/response/template';

export type { Template, TemplatesResponse, TemplateMetadata, TemplateInfo };

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE REGISTRY — scanned from local filesystem (metadata only)
// .hbs / .css / .png content is fetched from S3 at render time
// ─────────────────────────────────────────────────────────────────────────────

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');

function registerTemplate(registry: Map<string, TemplateInfo>, dir: string, dirName: string): void {
  const metaPath = path.join(dir, 'metadata.json');
  if (!fs.existsSync(metaPath)) return;

  try {
    const meta: TemplateMetadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    const info: TemplateInfo = {
      ...meta,
      hasPhoto: meta.hasPhoto ?? false,
      // S3 keys — used for content fetching
      hbsKey: `templates/${meta.id}/template.hbs`,
      cssKey: `templates/${meta.id}/style.css`,
      thumbnailKey: `templates/${meta.id}/${meta.thumbnail}`,
      // Local FS paths — used as dev fallback
      hbsPath: path.join(dir, 'template.hbs'),
      cssPath: path.join(dir, 'style.css'),
      thumbnailPath: path.join(dir, meta.thumbnail),
    };
    registry.set(meta.id, info);
    if (meta.slug && meta.slug !== meta.id) {
      registry.set(meta.slug, info);
    }
    if (dirName && dirName !== meta.id && !registry.has(dirName)) {
      registry.set(dirName, info);
    }
  } catch {
    console.warn(`[template.service] Failed to parse metadata for template: ${dirName}`);
  }
}

function scanTemplates(): Map<string, TemplateInfo> {
  const registry = new Map<string, TemplateInfo>();

  if (!fs.existsSync(TEMPLATES_DIR)) return registry;

  const topLevel = fs
    .readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  for (const entry of topLevel) {
    const entryPath = path.join(TEMPLATES_DIR, entry.name);
    const metaPath = path.join(entryPath, 'metadata.json');

    if (fs.existsSync(metaPath)) {
      // Flat structure: src/templates/<id>/metadata.json
      registerTemplate(registry, entryPath, entry.name);
    } else {
      // Category structure: src/templates/<category>/<id>/metadata.json
      const subDirs = fs
        .readdirSync(entryPath, { withFileTypes: true })
        .filter((d) => d.isDirectory());

      for (const sub of subDirs) {
        const subPath = path.join(entryPath, sub.name);
        registerTemplate(registry, subPath, `${entry.name}/${sub.name}`);
      }
    }
  }

  return registry;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT CACHE — fetches .hbs / .css from S3, caches per process
// ponytail: per-process cache; each pod caches independently — fine for
// immutable template content. Upgrade path: Redis if hot-reload needed.
// ─────────────────────────────────────────────────────────────────────────────

const _contentCache = new Map<string, string>();

/**
 * Fetches text content from S3, falling back to local FS in dev.
 * Caches the result in-process so each file is only fetched once per pod restart.
 */
export async function getTemplateContent(s3Key: string, localPath: string): Promise<string> {
  if (_contentCache.has(s3Key)) return _contentCache.get(s3Key)!;

  let text: string;

  try {
    const buf = await getObject(s3Key);
    text = buf.toString('utf-8');
  } catch (err) {
    // Dev fallback: read from local FS if S3 is unavailable (e.g. seed not yet run)
    if (localPath && fs.existsSync(localPath)) {
      console.warn(`[template.service] S3 fetch failed for ${s3Key}, falling back to local FS`);
      text = fs.readFileSync(localPath, 'utf-8');
    } else {
      throw err;
    }
  }

  _contentCache.set(s3Key, text);
  return text;
}

/**
 * Fetches binary content from S3, falling back to local FS in dev.
 * Used for thumbnail images.
 */
export async function getTemplateBinary(s3Key: string, localPath: string): Promise<Buffer> {
  try {
    return await getObject(s3Key);
  } catch {
    if (localPath && fs.existsSync(localPath)) {
      console.warn(`[template.service] S3 fetch failed for ${s3Key}, falling back to local FS`);
      return fs.readFileSync(localPath);
    }
    throw new Error(`Template asset not found in S3 or local FS: ${s3Key}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

export function listTemplates(): TemplateInfo[] {
  const seen = new Set<string>();
  const list: TemplateInfo[] = [];
  for (const t of scanTemplates().values()) {
    if (!seen.has(t.id)) {
      seen.add(t.id);
      list.push(t);
    }
  }
  return list;
}

export function getTemplate(templateId: string): TemplateInfo {
  const registry = scanTemplates();
  let template = registry.get(templateId);
  if (!template) {
    // Graceful fallback to classic-demo or first template
    template = registry.get('classic-demo') || Array.from(registry.values())[0];
  }
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  return template;
}

export function validateTemplateExists(templateId: string): boolean {
  return scanTemplates().has(templateId);
}

/** Checks whether the template's .hbs file has been uploaded to S3. */
export async function isTemplateSynced(templateId: string): Promise<boolean> {
  const t = getTemplate(templateId);
  return objectExists(t.hbsKey);
}

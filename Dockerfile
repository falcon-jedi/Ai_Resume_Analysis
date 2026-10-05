# syntax=docker/dockerfile:1.7

# ── Stage 1: install dependencies ───────────────────────────────────────────
FROM node:22-bookworm-slim AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update \
    && apt-get install -y --no-install-recommends chromium ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ── Stage 2: install npm deps ────────────────────────────────────────────────
FROM base AS dependencies

COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 3: build ───────────────────────────────────────────────────────────
FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# DATABASE_URL/DIRECT_URL are mounted as BuildKit secrets.
# They are needed only for `prisma generate` and static page generation.
# They are NOT baked into the final image.
RUN --mount=type=secret,id=database_url \
    --mount=type=secret,id=direct_url \
    export DATABASE_URL="$(cat /run/secrets/database_url)" && \
    export DIRECT_URL="$(cat /run/secrets/direct_url)" && \
    export RESEND_API_KEY="build-only-placeholder" && \
    npx prisma generate && \
    npm run build

# ── Stage 4: minimal runtime image ──────────────────────────────────────────
FROM base AS runner

ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# next.config.ts uses output: "standalone" — only copy what Next.js outputs.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Templates are read from the filesystem at runtime via fs.readdirSync.
COPY --from=builder --chown=nextjs:nodejs /app/src/templates ./src/templates

USER nextjs

EXPOSE 3000

# Healthcheck — hits the lightweight /api/public/health endpoint.
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/public/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]

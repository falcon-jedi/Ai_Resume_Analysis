-- Dynamic Subscription System Migration
-- Adds: priceInr, priceUsd, templateAccess, durationDays to pricing_plans
-- Drops: monthlyPrice, limitDownloadPdf, limitResumeCreate from pricing_plans
-- Adds: snapshotTemplateAccess, snapshotDurationDays, snapshotPriceInr, snapshotPriceUsd to subscriptions
-- Drops: snapshotMonthlyPrice, snapshotLimitResumes, snapshotLimitPdf from subscriptions
-- Adds: limit column to usage_tracking

-- ── pricing_plans ──────────────────────────────────────────────────────────
ALTER TABLE "pricing_plans"
  ADD COLUMN IF NOT EXISTS "priceInr"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "priceUsd"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "templateAccess" TEXT NOT NULL DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS "durationDays"   INTEGER;

-- Backfill priceInr from monthlyPrice (same currency store)
UPDATE "pricing_plans" SET "priceInr" = "monthlyPrice", "priceUsd" = ROUND(("monthlyPrice" * 0.012)::numeric, 2);

-- Drop deprecated columns
ALTER TABLE "pricing_plans"
  DROP COLUMN IF EXISTS "monthlyPrice",
  DROP COLUMN IF EXISTS "limitResumeCreate",
  DROP COLUMN IF EXISTS "limitDownloadPdf";

-- ── subscriptions ──────────────────────────────────────────────────────────
ALTER TABLE "subscriptions"
  ADD COLUMN IF NOT EXISTS "snapshotPriceInr"       DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "snapshotPriceUsd"       DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "snapshotTemplateAccess" TEXT,
  ADD COLUMN IF NOT EXISTS "snapshotDurationDays"   INTEGER;

ALTER TABLE "subscriptions"
  DROP COLUMN IF EXISTS "snapshotMonthlyPrice",
  DROP COLUMN IF EXISTS "snapshotLimitResumes",
  DROP COLUMN IF EXISTS "snapshotLimitPdf";

-- ── usage_tracking ─────────────────────────────────────────────────────────
ALTER TABLE "usage_tracking"
  ADD COLUMN IF NOT EXISTS "limit" INTEGER;

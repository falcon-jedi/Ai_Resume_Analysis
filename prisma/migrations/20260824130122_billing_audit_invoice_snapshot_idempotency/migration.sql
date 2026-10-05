/*
  Warnings:

  - The primary key for the `usage_tracking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `action` on the `usage_tracking` table. All the data in the column will be lost.
  - You are about to drop the column `count` on the `usage_tracking` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `usage_tracking` table. All the data in the column will be lost.
  - You are about to drop the column `periodEnd` on the `usage_tracking` table. All the data in the column will be lost.
  - You are about to drop the column `periodStart` on the `usage_tracking` table. All the data in the column will be lost.
  - Added the required column `feature` to the `usage_tracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `usage_tracking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "usage_tracking_userId_action_periodStart_key";

-- AlterTable
ALTER TABLE "pricing_plans" ADD COLUMN     "limitAiSuggestion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "limitAtsAnalysis" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "limitDownloadPdf" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "limitResumeCreate" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "snapshotBillingPeriod" TEXT,
ADD COLUMN     "snapshotCurrency" TEXT,
ADD COLUMN     "snapshotLimitAi" INTEGER,
ADD COLUMN     "snapshotLimitAts" INTEGER,
ADD COLUMN     "snapshotLimitPdf" INTEGER,
ADD COLUMN     "snapshotLimitResumes" INTEGER,
ADD COLUMN     "snapshotMonthlyPrice" DOUBLE PRECISION,
ADD COLUMN     "snapshotPlanName" TEXT;

-- AlterTable
ALTER TABLE "usage_tracking" DROP CONSTRAINT "usage_tracking_pkey",
DROP COLUMN "action",
DROP COLUMN "count",
DROP COLUMN "id",
DROP COLUMN "periodEnd",
DROP COLUMN "periodStart",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "feature" TEXT NOT NULL,
ADD COLUMN     "lastResetDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "used" INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT "usage_tracking_pkey" PRIMARY KEY ("userId", "feature");

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "lineItems" JSONB NOT NULL,
    "pdfData" BYTEA,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_jobs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "background_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_paymentId_key" ON "invoices"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_userId_idx" ON "invoices"("userId");

-- CreateIndex
CREATE INDEX "background_jobs_status_createdAt_idx" ON "background_jobs"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_eventId_key" ON "webhook_events"("eventId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "subscriptions_userId_status_idx" ON "subscriptions"("userId", "status");

-- CreateIndex
CREATE INDEX "subscriptions_currentPeriodEnd_status_idx" ON "subscriptions"("currentPeriodEnd", "status");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

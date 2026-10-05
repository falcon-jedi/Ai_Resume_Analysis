-- DropIndex
DROP INDEX "feedbacks_createdAt_idx";

-- DropIndex
DROP INDEX "feedbacks_status_idx";

-- DropIndex
DROP INDEX "invoices_userId_idx";

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE INDEX "ats_analyses_resumeId_idx" ON "ats_analyses"("resumeId");

-- CreateIndex
CREATE INDEX "feedbacks_status_createdAt_idx" ON "feedbacks"("status", "createdAt");

-- CreateIndex
CREATE INDEX "invoices_userId_createdAt_idx" ON "invoices"("userId", "createdAt");

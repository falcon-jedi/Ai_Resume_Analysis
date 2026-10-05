/*
  Warnings:

  - You are about to drop the column `contentScore` on the `ats_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `formatScore` on the `ats_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `keywordMatches` on the `ats_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `suggestions` on the `ats_analyses` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `ats_analyses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ats_analyses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ats_analyses" DROP CONSTRAINT "ats_analyses_resumeId_fkey";

-- DropIndex
DROP INDEX "ats_analyses_resumeId_idx";

-- AlterTable
ALTER TABLE "ats_analyses" DROP COLUMN "contentScore",
DROP COLUMN "formatScore",
DROP COLUMN "keywordMatches",
DROP COLUMN "suggestions",
ADD COLUMN     "aiExplanation" JSONB,
ADD COLUMN     "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "educationScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "experienceScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "formattingScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "keywordScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "matchedKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "matchedSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "missingKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "missingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "processingTimeMs" INTEGER,
ADD COLUMN     "resumeName" TEXT NOT NULL DEFAULT 'Uploaded Resume',
ADD COLUMN     "skillsScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "summaryScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "version" TEXT,
ALTER COLUMN "resumeId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ats_analyses_userId_idx" ON "ats_analyses"("userId");

-- CreateIndex
CREATE INDEX "ats_analyses_userId_analysisDate_idx" ON "ats_analyses"("userId", "analysisDate");

-- AddForeignKey
ALTER TABLE "ats_analyses" ADD CONSTRAINT "ats_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_analyses" ADD CONSTRAINT "ats_analyses_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

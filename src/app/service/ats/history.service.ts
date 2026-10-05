/**
 * ATS History Service — server-side Prisma operations for ATSAnalysis records.
 *
 * All methods are scoped to userId: no row can be read or deleted cross-user.
 * Server-side only — never import from client components.
 */

import { prisma } from '@/app/_lib/prisma';
import type { Prisma } from '@prisma/client';
import type { SaveAtsAnalysisDTO, ListAtsHistoryQueryDTO } from '@/app/api/model/request/ats';
import type { PaginatedATSHistory, ATSAnalysisDetail } from '@/app/api/model/response/ats';
import type { SaveAtsInput } from '@/app/api/client/ats/history-client';

export type {
  SaveAtsAnalysisDTO,
  ListAtsHistoryQueryDTO,
  PaginatedATSHistory,
  ATSAnalysisDetail,
  SaveAtsInput,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Insert a new ATSAnalysis record. Returns the created record's id. */
export async function saveAnalysis(
  userId: string,
  input: SaveAtsAnalysisDTO | SaveAtsInput,
): Promise<string> {
  const r = input.result;

  const created = await prisma.aTSAnalysis.create({
    data: {
      userId,
      resumeId: input.resumeId ?? undefined,
      resumeName: input.resumeName,
      jobDescription: input.jobDescription,
      jobTitle: input.jobTitle ?? null,
      overallScore: Math.round(r.overall_score),
      keywordScore: Math.round(r.keyword_score),
      experienceScore: Math.round(r.experience_score),
      skillsScore: Math.round(r.skills_score),
      educationScore: Math.round(r.education_score),
      summaryScore: Math.round(r.summary_score),
      formattingScore: Math.round(r.formatting_score),
      matchedKeywords: r.matched_keywords.map((k) => k.keyword),
      missingKeywords: r.missing_keywords,
      matchedSkills: r.matched_skills,
      missingSkills: r.missing_skills,
      aiExplanation: (r.ai_explanation ?? undefined) as unknown as Prisma.InputJsonValue,
      processingTimeMs: r.processing_time_ms ?? null,
      version: r.version ?? null,
    },
    select: { id: true },
  });

  return created.id;
}

/** Fetch paginated history for a user, newest first. */
export async function getUserHistory(
  userId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedATSHistory> {
  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.aTSAnalysis.findMany({
      where: { userId },
      orderBy: { analysisDate: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        resumeName: true,
        jobTitle: true,
        overallScore: true,
        analysisDate: true,
      },
    }),
    prisma.aTSAnalysis.count({ where: { userId } }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/** Fetch a single analysis — scoped to userId (strict tenancy). */
export async function getAnalysisById(
  id: string,
  userId: string,
): Promise<ATSAnalysisDetail | null> {
  return prisma.aTSAnalysis.findFirst({
    where: { id, userId },
  }) as Promise<ATSAnalysisDetail | null>;
}

/** Delete one analysis belonging to userId. */
export async function deleteAnalysis(id: string, userId: string) {
  return prisma.aTSAnalysis.deleteMany({ where: { id, userId } });
}

/** Delete all analyses for a user. */
export async function clearAllHistory(userId: string) {
  return prisma.aTSAnalysis.deleteMany({ where: { userId } });
}

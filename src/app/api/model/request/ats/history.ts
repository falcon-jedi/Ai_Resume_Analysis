import { z } from 'zod';
import type { ATSAnalyzeResponse } from '@/app/service/ai/types';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ats/save — Request validation
// ─────────────────────────────────────────────────────────────────────────────

export const saveAtsAnalysisSchema = z.object({
  resumeName: z.string().min(1, 'resumeName is required'),
  jobDescription: z.string().min(1, 'jobDescription is required'),
  jobTitle: z.string().optional(),
  resumeId: z.string().optional(),
  result: z
    .object({
      overall_score: z.number(),
      keyword_score: z.number(),
      experience_score: z.number(),
      skills_score: z.number(),
      education_score: z.number(),
      summary_score: z.number(),
      formatting_score: z.number(),
      matched_keywords: z.array(
        z
          .object({
            keyword: z.string(),
          })
          .passthrough(),
      ),
      missing_keywords: z.array(z.string()),
      matched_skills: z.array(z.string()),
      missing_skills: z.array(z.string()),
      ai_explanation: z.unknown().optional().nullable(),
      processing_time_ms: z.number().optional(),
      version: z.string().optional(),
    })
    .passthrough(),
});

export interface SaveAtsAnalysisDTO {
  resumeName: string;
  jobDescription: string;
  jobTitle?: string;
  resumeId?: string;
  result: ATSAnalyzeResponse;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ats/history — Query validation
// ─────────────────────────────────────────────────────────────────────────────

export const listAtsHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListAtsHistoryQueryDTO = z.infer<typeof listAtsHistoryQuerySchema>;

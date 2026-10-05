import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/resume/ai-improve — AI resume section improvement request validation
// ─────────────────────────────────────────────────────────────────────────────

export const VALID_AI_IMPROVE_SECTION_TYPES = [
  'summary',
  'experience',
  'projects',
  'objective',
] as const;

export type AIImproveSectionType = (typeof VALID_AI_IMPROVE_SECTION_TYPES)[number];

export const aiImproveSchema = z.object({
  sectionType: z
    .string()
    .refine(
      (v): v is AIImproveSectionType =>
        (VALID_AI_IMPROVE_SECTION_TYPES as readonly string[]).includes(v),
      {
        message: `sectionType must be one of: ${VALID_AI_IMPROVE_SECTION_TYPES.join(', ')}`,
      },
    ),
  currentText: z.string().min(1, 'currentText is required').max(8000, 'currentText too long'),
  resumeContext: z.string().max(20000).optional(),
});

export type AIImproveRequestDTO = z.infer<typeof aiImproveSchema>;
export type AIImproveDTO = AIImproveRequestDTO;

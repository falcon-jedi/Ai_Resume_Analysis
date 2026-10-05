import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ats/analyze — Request validation
// ─────────────────────────────────────────────────────────────────────────────

export const atsAnalyzeSchema = z.object({
  resumeText: z.string().optional(),
  resumeFileName: z.string().optional(),
  resumeFileBytes: z.string().optional(),
  jobDescriptionText: z.string().min(1, 'Job description text is required'),
  stream: z.boolean().optional(),
});

export type ATSAnalyzeRequestDTO = z.infer<typeof atsAnalyzeSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ats/extract-jd — Request validation
// ─────────────────────────────────────────────────────────────────────────────

export const extractJdSchema = z.object({
  url: z.string().url('Please enter a valid job posting URL (e.g. https://...)'),
});

export type ExtractJdRequestDTO = z.infer<typeof extractJdSchema>;

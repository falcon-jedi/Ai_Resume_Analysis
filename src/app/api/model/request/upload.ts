import { z } from 'zod';
import { PhotoMimeType } from '@/app/api/model/enums/upload';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/upload/resume-photo — Request validation
// ─────────────────────────────────────────────────────────────────────────────

export const presignedUrlRequestSchema = z.object({
  resumeId: z.string().min(1, 'resumeId is required'),
  contentType: z.nativeEnum(PhotoMimeType).or(z.string().min(1)),
});

export type PresignedUrlRequestDTO = z.infer<typeof presignedUrlRequestSchema>;

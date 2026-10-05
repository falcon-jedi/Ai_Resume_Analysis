import { z } from 'zod';
import { FeedbackType } from '@/app/api/model/enums/feedback';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/feedback — Request validation
// ─────────────────────────────────────────────────────────────────────────────

export const feedbackSchema = z.object({
  type: z.nativeEnum(FeedbackType),
  rating: z.number().int().min(1).max(5).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(3, 'Message must be at least 3 characters'),
  pageUrl: z.union([z.string().url(), z.literal('')]).optional(),
  // For unauthenticated users
  name: z.string().optional(),
  email: z
    .union([z.string().email('Please provide a valid email address'), z.literal('')])
    .optional(),
  // Turnstile CAPTCHA token
  turnstileToken: z.string().optional(),
});

export type FeedbackRequestDTO = z.infer<typeof feedbackSchema>;

export interface FeedbackEmailParams {
  userName: string;
  userEmail: string;
  type: FeedbackType | `${FeedbackType}` | string;
  rating?: number | null;
  subject?: string | null;
  message: string;
  pageUrl?: string | null;
  submittedAt: Date;
}

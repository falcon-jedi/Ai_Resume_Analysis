import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/user/profile — update basic user meta (name, jobTitle, industry)
// Career section data is saved via the existing PATCH /api/resume/:id endpoint.
// ─────────────────────────────────────────────────────────────────────────────

export const updateUserMetaSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  jobTitle: z.string().max(150).optional(),
  industry: z.string().max(150).optional(),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

export type UpdateUserMetaDTO = z.infer<typeof updateUserMetaSchema>;

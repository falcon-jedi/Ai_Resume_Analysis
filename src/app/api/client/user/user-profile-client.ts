import { apiFetch } from '@/app/api/client/_utils/api-client';
import type { UpdateUserMetaDTO } from '@/app/api/model/request/user/user-profile';
import type { UserProfile } from '@/app/api/model/response/user/user-profile';

export type { UserProfile };

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/user/profile
// Returns user meta + profileResumeId without creating any data.
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserProfileClient(): Promise<UserProfile> {
  const res = await apiFetch<ApiResponse<UserProfile>>('/api/user/profile');
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/user/profile
// Updates basic user meta: name, jobTitle, industry, image.
// Career section data is saved via updateResumeClient(profileResumeId, ...).
// ─────────────────────────────────────────────────────────────────────────────

export async function updateUserMetaClient(data: UpdateUserMetaDTO): Promise<UserProfile> {
  const res = await apiFetch<ApiResponse<UserProfile>>('/api/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.data;
}

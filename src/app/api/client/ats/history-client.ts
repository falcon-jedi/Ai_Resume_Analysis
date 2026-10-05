/**
 * ATS History API Client — browser-side fetch wrappers.
 *
 * Follows the same pattern as resume-client.ts:
 *   - Uses apiFetch() from _utils/api-client.ts
 *   - Calls Next.js API routes, never the Python service directly
 */

import { apiFetch } from '@/app/api/client/_utils/api-client';
import type { SaveAtsAnalysisDTO } from '@/app/api/model/request/ats/history';
import type { PaginatedATSHistory, ATSAnalysisDetail } from '@/app/api/model/response/ats';

export type { PaginatedATSHistory, ATSAnalysisDetail, SaveAtsAnalysisDTO };
export type SaveAtsInput = SaveAtsAnalysisDTO;

// ---------------------------------------------------------------------------
// Save analysis
// ---------------------------------------------------------------------------

export async function saveAtsAnalysisClient(input: SaveAtsAnalysisDTO): Promise<string> {
  const res = await apiFetch<{ success: boolean; data: { id: string } }>('/api/ats/save', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return res.data.id;
}

// ---------------------------------------------------------------------------
// History list
// ---------------------------------------------------------------------------

export async function listAtsHistoryClient(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedATSHistory> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const url = `/api/ats/history${query.toString() ? `?${query}` : ''}`;
  const res = await apiFetch<{ success: boolean; data: PaginatedATSHistory }>(url);
  return res.data;
}

// ---------------------------------------------------------------------------
// Single result
// ---------------------------------------------------------------------------

export async function getAtsResultClient(id: string): Promise<ATSAnalysisDetail> {
  const res = await apiFetch<{ success: boolean; data: ATSAnalysisDetail }>(
    `/api/ats/result/${id}`,
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// Delete / clear
// ---------------------------------------------------------------------------

export async function deleteAtsAnalysisClient(id: string): Promise<void> {
  await apiFetch(`/api/ats/result/${id}`, { method: 'DELETE' });
}

export async function clearAllAtsHistoryClient(): Promise<void> {
  await apiFetch('/api/ats/history/clear', { method: 'DELETE' });
}

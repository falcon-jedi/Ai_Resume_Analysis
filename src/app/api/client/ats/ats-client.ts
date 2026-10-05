/**
 * ATS API client — browser-side functions for the ATS analysis endpoint.
 *
 * Follows the same pattern as resume-client.ts:
 *   - Uses apiFetch() from _utils/api-client.ts
 *   - Calls the Next.js API route (NOT the Python service directly)
 *   - Returns typed data
 */

import { apiFetch } from '@/app/api/client/_utils/api-client';
import type { ATSAnalyzeRequestDTO } from '@/app/api/model/request/ats/analyze';
import type { ATSAnalyzeApiResponse, ExtractJdApiResponse } from '@/app/api/model/response/ats';
import type { ATSAnalyzeResponse } from '@/app/service/ai/types';

export type ATSAnalyzeInput = ATSAnalyzeRequestDTO;
export type ExtractJdClientResponse = ExtractJdApiResponse;

/**
 * Submit a resume + JD for ATS analysis.
 */
export async function analyzeATSClient(input: ATSAnalyzeInput): Promise<ATSAnalyzeResponse> {
  const res = await apiFetch<ATSAnalyzeApiResponse>('/api/ats/analyze', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return res.data;
}

/**
 * Extract job description text from a target URL.
 */
export async function extractJdFromUrlClient(url: string): Promise<ExtractJdClientResponse> {
  return await apiFetch<ExtractJdClientResponse>('/api/ats/extract-jd', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

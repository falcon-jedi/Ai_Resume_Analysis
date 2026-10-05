'use client';

/**
 * Frontend ATS service — the only file in `src/app/app` that knows
 * the API path for ATS analysis.
 *
 * Components must never call fetch() directly.
 * The hook (use-ats.ts) calls this service.
 * This service calls the API client.
 *
 * Does NOT contain:
 *   - UI logic
 *   - State management
 *   - React imports
 */

import { analyzeATSClient } from '@/app/api/client/ats/ats-client';
import type { ATSAnalyzeResponse } from '@/app/service/ai/types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ATSAnalyzeInput {
  resumeText?: string;
  resumeFileName?: string;
  resumeFileBytes?: string;
  jobDescriptionText: string;
}

export type { ATSAnalyzeResponse };

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Submit a resume + job description for deterministic ATS analysis.
 *
 * @param input - resume text and job description text
 * @returns Typed ATS report from the AI service
 */
export async function analyzeResume(input: ATSAnalyzeInput): Promise<ATSAnalyzeResponse> {
  return analyzeATSClient(input);
}

// [ignoring loop detection]
export interface StreamEvent {
  event: string;
  data: unknown;
}

/**
 * Submit a resume + job description for streaming ATS analysis.
 */
export async function analyzeResumeStream(
  input: ATSAnalyzeInput,
  onEvent: (event: StreamEvent) => void,
  onError: (error: Error) => void,
): Promise<void> {
  try {
    const response = await fetch('/api/ats/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: input.resumeText,
        resumeFileName: input.resumeFileName,
        resumeFileBytes: input.resumeFileBytes,
        jobDescriptionText: input.jobDescriptionText,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(errorJson?.message || `Request failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is empty');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const lines = part.split('\n');
        let event = '';
        let dataStr = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            event = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            dataStr = line.substring(5).trim();
          }
        }

        if (event && dataStr) {
          try {
            const data = JSON.parse(dataStr);
            onEvent({ event, data });
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

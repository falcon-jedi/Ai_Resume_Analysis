'use client';

/**
 * React Query hooks for ATS analysis history.
 *
 * Follows the same pattern as use-resumes.ts.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listAtsHistoryClient,
  getAtsResultClient,
  saveAtsAnalysisClient,
  deleteAtsAnalysisClient,
  clearAllAtsHistoryClient,
  type SaveAtsInput,
} from '@/app/api/client/ats/history-client';

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const atsKeys = {
  all: ['ats'] as const,
  history: (params: Record<string, unknown> = {}) => [...atsKeys.all, 'history', params] as const,
  result: (id: string) => [...atsKeys.all, 'result', id] as const,
};

// ─── LIST ─────────────────────────────────────────────────────────────────────
export function useAtsHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: atsKeys.history(params ?? {}),
    queryFn: () => listAtsHistoryClient(params),
  });
}

// ─── SINGLE RESULT ────────────────────────────────────────────────────────────
export function useAtsResult(id: string) {
  return useQuery({
    queryKey: atsKeys.result(id),
    queryFn: () => getAtsResultClient(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // DB records don't change — cache for 5 min
  });
}

// ─── SAVE ─────────────────────────────────────────────────────────────────────
export function useSaveAtsAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveAtsInput) => saveAtsAnalysisClient(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: atsKeys.history() });
    },
  });
}

// ─── DELETE ONE ───────────────────────────────────────────────────────────────
export function useDeleteAtsAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAtsAnalysisClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: atsKeys.history() });
    },
  });
}

// ─── CLEAR ALL ────────────────────────────────────────────────────────────────
export function useClearAtsHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearAllAtsHistoryClient(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: atsKeys.history() });
    },
  });
}

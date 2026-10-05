'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listResumesClient,
  getResumeClient,
  createResumeClient,
  updateResumeClient,
  deleteResumeClient,
  duplicateResumeClient,
  previewResumeClient,
  downloadPdfClient,
} from '@/app/api/client/resume/resume-client';
import type { CreateResumeDTO, UpdateResumeDTO } from '@/app/api/model/request/resume/resume';

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const resumeKeys = {
  all: ['resumes'] as const,
  lists: () => [...resumeKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...resumeKeys.lists(), params] as const,
  detail: (id: string) => [...resumeKeys.all, 'detail', id] as const,
  preview: (id: string) => [...resumeKeys.all, 'preview', id] as const,
};

// ─── LIST ─────────────────────────────────────────────────────────────────────
export function useResumes(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: resumeKeys.list(params ?? {}),
    queryFn: () => listResumesClient(params),
  });
}

// ─── DETAIL ───────────────────────────────────────────────────────────────────
export function useResume(id: string) {
  return useQuery({
    queryKey: resumeKeys.detail(id),
    queryFn: () => getResumeClient(id),
    enabled: !!id,
  });
}

// ─── PREVIEW ──────────────────────────────────────────────────────────────────
export function useResumePreview(id: string, enabled = true) {
  return useQuery({
    queryKey: resumeKeys.preview(id),
    queryFn: () => previewResumeClient(id),
    enabled: !!id && enabled,
    staleTime: 0, // always refetch after autosave
  });
}

// ─── CREATE ───────────────────────────────────────────────────────────────────
export function useCreateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateResumeDTO) => createResumeClient(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.lists() });
    },
  });
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export function useUpdateResume(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateResumeDTO) => updateResumeClient(id, data),
    onSuccess: (updated) => {
      qc.setQueryData(resumeKeys.detail(id), updated);
      qc.invalidateQueries({ queryKey: resumeKeys.lists() });
      qc.invalidateQueries({ queryKey: resumeKeys.preview(id) });
    },
  });
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export function useDeleteResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResumeClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.lists() });
    },
  });
}

// ─── DUPLICATE ────────────────────────────────────────────────────────────────
export function useDuplicateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateResumeClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.lists() });
    },
  });
}

// ─── DOWNLOAD PDF ─────────────────────────────────────────────────────────────
export function useDownloadPdf() {
  return useMutation({
    mutationFn: ({ id, filename }: { id: string; filename?: string }) =>
      downloadPdfClient(id, filename),
  });
}

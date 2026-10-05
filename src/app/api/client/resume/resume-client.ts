import { apiFetch } from '@/app/api/client/_utils/api-client';
import type { CreateResumeDTO, UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import type { ResumeDetail, PaginatedResumes } from '@/app/api/model/response/resume';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE RESUME
// ─────────────────────────────────────────────────────────────────────────────

export async function createResumeClient(data: CreateResumeDTO): Promise<ResumeDetail> {
  const res = await apiFetch<ApiResponse<ResumeDetail>>('/api/resume', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST RESUMES
// ─────────────────────────────────────────────────────────────────────────────

export async function listResumesClient(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedResumes> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);

  const url = `/api/resume${query.toString() ? `?${query}` : ''}`;
  return apiFetch<PaginatedResumes>(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE RESUME
// ─────────────────────────────────────────────────────────────────────────────

export async function getResumeClient(id: string): Promise<ResumeDetail> {
  const res = await apiFetch<ApiResponse<ResumeDetail>>(`/api/resume/${id}`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE RESUME (single PATCH — metadata + any sections)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateResumeClient(id: string, data: UpdateResumeDTO): Promise<ResumeDetail> {
  const res = await apiFetch<ApiResponse<ResumeDetail>>(`/api/resume/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE RESUME
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteResumeClient(id: string): Promise<void> {
  await apiFetch(`/api/resume/${id}`, { method: 'DELETE' });
}

// ─────────────────────────────────────────────────────────────────────────────
// DUPLICATE RESUME
// ─────────────────────────────────────────────────────────────────────────────

export async function duplicateResumeClient(id: string): Promise<ResumeDetail> {
  const res = await apiFetch<ApiResponse<ResumeDetail>>(`/api/resume/${id}/duplicate`, {
    method: 'POST',
  });
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW (returns HTML string)
// ─────────────────────────────────────────────────────────────────────────────

export async function previewResumeClient(id: string): Promise<string> {
  const res = await apiFetch<{ success: boolean; html: string }>(`/api/resume/${id}/preview`, {
    method: 'POST',
  });
  return res.html;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD PDF (triggers browser download)
// ─────────────────────────────────────────────────────────────────────────────

export async function downloadPdfClient(id: string, filename?: string): Promise<void> {
  const response = await fetch(`/api/resume/${id}/pdf`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to generate PDF');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `resume-${id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

import type { Template, TemplatesResponse } from '@/app/api/model/response/template';

export type { Template, TemplatesResponse };

export async function listTemplatesClient(): Promise<TemplatesResponse> {
  const res = await apiFetch<{ success: boolean; data: TemplatesResponse }>('/api/template');
  return res.data;
}

export async function getTemplateClient(templateId: string) {
  const res = await apiFetch<{ success: boolean; data: unknown }>(`/api/template/${templateId}`);
  return res.data;
}

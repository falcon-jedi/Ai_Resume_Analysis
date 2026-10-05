import { apiFetch } from '@/app/api/client/_utils/api-client';
import type { PresignedUrlRequestDTO } from '@/app/api/model/request/upload';
import type { PresignedUrlResponseDTO } from '@/app/api/model/response/upload';

/**
 * Step 1 of 2 — get a pre-signed S3 PUT URL for a resume profile photo.
 * Key is fixed per resume: resume_picture/{resumeId}/avatar.{ext}
 * Uploading again auto-overwrites the old photo.
 */
export async function getResumePhotoUploadUrl(
  resumeId: string,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const payload: PresignedUrlRequestDTO = { resumeId, contentType };
  const res = await apiFetch<PresignedUrlResponseDTO>('/api/upload/resume-photo', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { uploadUrl: res.uploadUrl, publicUrl: res.publicUrl };
}

/**
 * Step 2 of 2 — PUT the blob directly to S3 using the pre-signed URL.
 */
export async function uploadBlobToS3(
  uploadUrl: string,
  blob: Blob,
  contentType: string,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`);
}

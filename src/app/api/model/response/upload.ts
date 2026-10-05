// ─────────────────────────────────────────────────────────────────────────────
// POST /api/upload/resume-photo — Response Model
// ─────────────────────────────────────────────────────────────────────────────

export interface PresignedPhotoUrl {
  uploadUrl: string;
  publicUrl: string;
}

export interface PresignedUrlResponseDTO {
  success: boolean;
  uploadUrl: string;
  publicUrl: string;
  message?: string;
}

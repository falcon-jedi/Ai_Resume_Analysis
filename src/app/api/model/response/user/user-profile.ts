// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE RESPONSE MODEL
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfileResponse {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  jobTitle: string | null;
  industry: string | null;
  /** ID of the reserved "Profile Resume" (status=PROFILE). */
  profileResumeId: string | null;
}

export type UserProfile = UserProfileResponse;

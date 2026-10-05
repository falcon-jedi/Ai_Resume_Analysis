import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/(controller)/_util/auth-guard';
import { validateRequest } from '@/app/api/(controller)/_util/validate';
import { updateUserMetaSchema } from '@/app/api/model/request/user/user-profile';
import { getUserProfile, updateUserMeta } from '@/app/service/user/user-profile.service';

/**
 * GET /api/user/profile
 *
 * Returns the current user's meta fields (name, email, jobTitle, industry, image)
 * plus their `profileResumeId`. Reading never creates a profile resume; it is
 * created on the first explicit profile save instead.
 */
export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const profile = await getUserProfile(session!.user.id);

    return NextResponse.json({ success: true, data: profile });
  } catch (err) {
    console.error('[GET /api/user/profile]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to load profile' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/user/profile
 *
 * Updates the User row fields: name, jobTitle, industry, image.
 * Career section data (experience, education, etc.) is saved separately
 * via the existing PATCH /api/resume/:profileResumeId endpoint.
 */
export async function PATCH(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const result = await validateRequest(req, updateUserMetaSchema);
    if (result.error) return result.error;

    const profile = await updateUserMeta(session!.user.id, result.data);

    return NextResponse.json({ success: true, data: profile });
  } catch (err) {
    console.error('[PATCH /api/user/profile]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 },
    );
  }
}

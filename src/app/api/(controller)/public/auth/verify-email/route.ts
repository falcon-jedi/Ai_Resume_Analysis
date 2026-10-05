import { NextResponse } from 'next/server';
import { validateRequest } from '@/app/api/(controller)/_util/validate';
import { verifyEmailSchema } from '@/app/api/model/request/auth/auth';
import { verifyEmail } from '@/app/service/auth/verify-email.service';

/**
 * POST /api/public/auth/verify-email
 */
export async function POST(request: Request) {
  try {
    // 1. Validate
    const result = await validateRequest(request, verifyEmailSchema);
    if (result.error) return result.error;

    // 3. Verify
    await verifyEmail(result.data.token);

    // 4. Return success
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification failed';

    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

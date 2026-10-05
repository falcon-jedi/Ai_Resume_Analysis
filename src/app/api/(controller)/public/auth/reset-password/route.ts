import { NextResponse } from 'next/server';
import { validateRequest } from '@/app/api/(controller)/_util/validate';
import { resetPasswordSchema } from '@/app/api/model/request/auth/auth';
import { resetPassword } from '@/app/service/auth/reset-password.service';

export async function POST(request: Request) {
  try {
    // 1. Validate
    const result = await validateRequest(request, resetPasswordSchema);
    if (result.error) return result.error;

    // 3. Reset password
    await resetPassword(result.data.token, result.data.password);

    // 4. Return success
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Password reset failed';

    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { validateRequest } from '@/app/api/(controller)/_util/validate';
import { forgotPasswordSchema } from '@/app/api/model/request/auth/auth';
import { forgotPassword } from '@/app/service/auth/forgot-password.service';

export async function POST(request: Request) {
  try {
    // 1. Validate
    const result = await validateRequest(request, forgotPasswordSchema);
    if (result.error) return result.error;

    // 3. Process (service handles anti-enumeration silently)
    await forgotPassword(result.data.email);

    // 4. Always return success (anti-enumeration)
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('[FORGOT PASSWORD ERROR]', error);

    // Still return success to prevent enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  }
}

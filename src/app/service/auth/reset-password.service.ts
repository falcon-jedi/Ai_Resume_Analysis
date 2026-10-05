import { hash } from 'bcryptjs';
import { prisma } from '@/app/_lib/prisma';
import type { ResetPasswordRequest } from '@/app/api/model/request/auth/auth';
import type { AuthResponse } from '@/app/api/model/response/auth';

export type { ResetPasswordRequest, AuthResponse };

/**
 * Reset password service — consumes a PasswordResetToken and updates password.
 */
export async function resetPassword(
  tokenOrInput: string | ResetPasswordRequest,
  maybePassword?: string,
): Promise<void> {
  const token = typeof tokenOrInput === 'string' ? tokenOrInput : tokenOrInput.token;
  const newPassword = typeof tokenOrInput === 'string' ? maybePassword! : tokenOrInput.password;

  // 1. Find the token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    throw new Error('Invalid or expired reset token');
  }

  // 2. Check expiration
  if (new Date() > resetToken.expires) {
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });
    throw new Error('Reset token has expired. Please request a new one.');
  }

  // 3. Hash new password
  const password = await hash(newPassword, 12);

  // 4. Update password + 5. Delete token in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { email: resetToken.email },
      data: { password },
    });

    // Delete ALL reset tokens for this email
    await tx.passwordResetToken.deleteMany({
      where: { email: resetToken.email },
    });
  });
}

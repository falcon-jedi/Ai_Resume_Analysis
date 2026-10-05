import { prisma } from '@/app/_lib/prisma';
import type { VerifyEmailRequest } from '@/app/api/model/request/auth/auth';
import type { UserResponse, AuthResponse } from '@/app/api/model/response/auth';

export type { VerifyEmailRequest, UserResponse, AuthResponse };

/**
 * Verify email service — consumes a VerificationToken.
 *
 * Flow:
 * 1. Find token in database
 * 2. Check if token is expired
 * 3. Update user's emailVerified timestamp
 * 4. Delete the consumed token (single-use)
 *
 * SECURITY:
 * - Token is deleted immediately after use (prevents replay)
 * - Expired tokens are rejected
 * - No user information is leaked if token is invalid
 */
export async function verifyEmail(input: string | VerifyEmailRequest) {
  const token = typeof input === 'string' ? input : input.token;
  // 1. Find the token
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    throw new Error('Invalid or expired verification token');
  }

  // 2. Check expiration
  if (new Date() > verificationToken.expires) {
    // Clean up the expired token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    throw new Error('Verification token has expired. Please request a new one.');
  }

  // 3. Mark email as verified
  const user = await prisma.user.update({
    where: { email: verificationToken.email },
    data: { emailVerified: new Date() },
  });

  // 4. Delete the consumed token (single-use)
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  return user;
}

import { prisma } from '@/app/_lib/prisma';
import type { ForgotPasswordRequest } from '@/app/api/model/request/auth/auth';
import type { AuthResponse } from '@/app/api/model/response/auth';
import { generateToken, generateExpiration } from './token.service';
import { sendPasswordResetEmail } from './email.service';

export type { ForgotPasswordRequest, AuthResponse };

/**
 * Forgot password service — generates a reset token and sends email.
 *
 * Flow:
 * 1. Find user by email
 * 2. If no user found, return silently (prevent user enumeration)
 * 3. Delete any existing reset tokens for this email
 * 4. Generate new token
 * 5. Send password reset email
 *
 * SECURITY:
 * - We NEVER reveal whether the email exists in our database.
 *   The response is always "If an account exists, we sent an email."
 *   This prevents attackers from enumerating valid email addresses.
 * - Existing tokens are deleted before creating a new one,
 *   ensuring only the latest token is valid.
 */
export async function forgotPassword(emailOrInput: string | ForgotPasswordRequest): Promise<void> {
  const email = typeof emailOrInput === 'string' ? emailOrInput : emailOrInput.email;
  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // 2. Silently return if user doesn't exist (anti-enumeration)
  if (!user) {
    return;
  }

  // 3. Only allow password reset for credential users
  if (!user.password) {
    // This user signed up via Google OAuth — no password to reset.
    // Still return silently to prevent enumeration.
    return;
  }

  // 4. Delete any existing reset tokens
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  // 5. Generate new token
  const token = generateToken();
  const expires = generateExpiration(1); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  // 6. Send email
  await sendPasswordResetEmail(email, token);
}

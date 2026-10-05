import { hash } from 'bcryptjs';
import { prisma } from '@/app/_lib/prisma';
import { generateToken, generateExpiration } from './token.service';
import { sendVerificationEmail } from './email.service';
import type { SignupRequest } from '@/app/api/model/request/auth/auth';
import type { UserResponse, SignupResponse } from '@/app/api/model/response/auth';

export type { SignupRequest, UserResponse, SignupResponse };

/**
 * Signup service — handles email/password registration.
 *
 * Flow:
 * 1. Check if email already exists → reject if so
 * 2. Hash password with bcrypt (cost 12)
 * 3. Create User record
 * 4. Create Account record (type: "credentials")
 * 5. Create VerificationToken
 * 6. Send verification email via Resend
 *
 * SECURITY:
 * - Password is hashed BEFORE storage (bcrypt, cost 12)
 * - Verification token is cryptographically random (32 bytes)
 * - Token expires in 1 hour
 * - User cannot login until email is verified
 * - We do NOT reveal whether an email is already registered
 *   (to prevent user enumeration). Instead we return a generic
 *   success message. However, for better UX during MVP we DO
 *   reveal it — tighten this before going to production.
 */
export async function signupUser(data: SignupRequest) {
  // 0. Block admin email squatting — must be first check
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.includes(data.email.toLowerCase())) {
    throw new Error('This email cannot be used for registration');
  }

  // 1. Check for existing user
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  // 2. Hash password
  const password = await hash(data.password, 12);

  // 3. Create user + account in a transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password,
      },
    });

    // 4. Create credentials account
    await tx.account.create({
      data: {
        userId: newUser.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: newUser.id,
      },
    });

    return newUser;
  });

  // 5. Create verification token
  // Delete any existing tokens for this email first
  await prisma.verificationToken.deleteMany({
    where: { email: data.email },
  });

  const token = generateToken();
  const expires = generateExpiration(1); // 1 hour

  await prisma.verificationToken.create({
    data: {
      email: data.email,
      token,
      expires,
    },
  });

  // 6. Send verification email
  await sendVerificationEmail(data.email, token);

  return user;
}

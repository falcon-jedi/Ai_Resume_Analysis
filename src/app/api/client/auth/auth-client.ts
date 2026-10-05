import { signIn, signOut, getSession } from 'next-auth/react';
import type { Session } from 'next-auth';

import { apiFetch } from '@/app/api/client/_utils/api-client';

// Request DTOs
import type {
  SignupRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/app/api/model/request/auth/auth';

// Response DTOs
import type {
  SignupResponse,
  AuthResponse,
  LoginResponse,
  UserResponse,
} from '@/app/api/model/response/auth';

// SIGNUP
export async function signupClient(signupRequest: SignupRequest): Promise<SignupResponse> {
  return apiFetch<SignupResponse>('/api/public/signup', {
    method: 'POST',
    body: JSON.stringify(signupRequest),
  });
}

// VERIFY EMAIL
export async function verifyEmailClient(
  verifyEmailRequest: VerifyEmailRequest,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/public/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(verifyEmailRequest),
  });
}

// FORGOT PASSWORD
export async function forgotPasswordClient(
  forgotPasswordRequest: ForgotPasswordRequest,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/public/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(forgotPasswordRequest),
  });
}

// RESET PASSWORD
export async function resetPasswordClient(
  resetPasswordRequest: ResetPasswordRequest,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/public/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(resetPasswordRequest),
  });
}

// RESEND VERIFICATION EMAIL
export async function resendVerificationClient(
  resendVerificationRequest: Pick<SignupRequest, 'email'>,
): Promise<AuthResponse> {
  void resendVerificationRequest;

  // TODO: implement when POST /api/public/auth/resend-verification is added.
  return {
    success: false,
    message: 'Resend verification endpoint is not implemented yet.',
  };
}

// AUTH.JS WRAPPER FUNCTIONS

// LOGIN WITH EMAIL + PASSWORD
export async function loginClient(loginRequest: LoginRequest): Promise<LoginResponse> {
  let result;
  try {
    result = await signIn('credentials', {
      email: loginRequest.email,
      password: loginRequest.password,
      redirect: false,
    });
  } catch (err) {
    // NextAuth throws "Failed to construct 'URL': Invalid URL" when the server
    // returns a 429 JSON body instead of a redirect URL.
    // Surface it as a structured rate-limit response so the form can handle it.
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('URL') || msg.includes('construct')) {
      return { success: false, message: 'Rate limit exceeded. Please retry after 900 seconds.' };
    }
    throw err;
  }

  if (!result) {
    return { success: false, message: 'Login failed. Please try again.' };
  }

  if (result.error) {
    return { success: false, message: result.error };
  }

  return { success: true, message: 'Logged in successfully.' };
}

// GOOGLE LOGIN
export async function googleLoginClient(callbackUrl: string = '/app/dashboard'): Promise<void> {
  await signIn('google', { callbackUrl });
}

// LOGOUT
export async function logoutClient(callbackUrl: string = '/'): Promise<void> {
  await signOut({ callbackUrl });
}

// GET SESSION
export async function getSessionClient(): Promise<Session | null> {
  return getSession();
}

// GET CURRENT USER
export async function getCurrentUserClient(): Promise<UserResponse | null> {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const u = session.user as {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
    jobTitle?: string | null;
    industry?: string | null;
    role: string;
    createdAt?: Date;
  };

  return {
    id: u.id,
    name: u.name ?? null,
    email: u.email,
    emailVerified: u.emailVerified ?? null,
    image: u.image ?? null,
    jobTitle: u.jobTitle ?? null,
    industry: u.industry ?? null,
    role: u.role,
    createdAt: u.createdAt ?? new Date(),
  };
}

// REFRESH SESSION
export async function refreshSessionClient(): Promise<Session | null> {
  return getSession();
}

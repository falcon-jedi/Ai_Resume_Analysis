'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useRateLimit } from '@/app/app/_hooks/use-rate-limit';
import { RateLimitError } from '@/app/api/client/_utils/api-client';

import { resetPasswordSchema } from '@/app/api/model/request/auth/auth';
import { resetPasswordClient } from '@/app/api/client/auth/auth-client';
import { PasswordStrength } from '../../_components/auth/password-strength';
import { PasswordRequirements } from '../../_components/auth/password-requirements';
import { ConfirmPasswordStatus } from '../../_components/auth/confirm-password-status';
import { allSatisfied } from '../../_components/auth/password-rules';
import { AuthCardLayout, AUTH_PAGE_CONFIGS } from '../../_components/auth/auth-card-layout';

const resetFormSchema = resetPasswordSchema
  .extend({
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetFormValues = z.infer<typeof resetFormSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { isRateLimited, secondsLeft, triggerRateLimit } = useRateLimit();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: { token: token ?? '' },
    mode: 'onChange',
  });

  const password = watch('password') ?? '';
  const confirmPassword = watch('confirmPassword') ?? '';
  const passwordReady = allSatisfied(password) && password === confirmPassword;

  const onSubmit = async (data: ResetFormValues) => {
    setServerError(null);

    try {
      const result = await resetPasswordClient({
        token: data.token,
        password: data.password,
      });

      if (!result.success) {
        setServerError(result.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/app/login'), 2500);
    } catch (err) {
      if (err instanceof RateLimitError) {
        triggerRateLimit(err.retryAfter);
        return;
      }
      setServerError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    }
  };

  const renderContent = () => {
    if (!token) {
      return (
        <div className="space-y-6 text-center py-4">
          <IconMapper name="link_off" className="text-[#ba1a1a] text-5xl" />
          <header className="space-y-2">
            <h3 className="font-['Playfair_Display'] text-[24px] leading-[32px] font-semibold text-[#2b1611]">
              Invalid reset link
            </h3>
            <p className="font-['Hanken_Grotesk'] text-[16px] leading-[24px] text-[#564240]">
              This password reset link is missing or invalid. Please request a new one.
            </p>
          </header>
          <div className="pt-4">
            <Link
              className="font-['Hanken_Grotesk'] text-[14px] text-[#5b060c] font-bold border-b border-[#5b060c]/30 hover:border-[#5b060c] transition-all inline-flex items-center gap-1"
              href="/app/forgot-password"
            >
              Request a new link
            </Link>
          </div>
        </div>
      );
    }

    if (success) {
      return (
        <div className="space-y-6 text-center py-4">
          <IconMapper
            name="check_circle"
            className="text-[#2a7040] text-5xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          />
          <header className="space-y-2">
            <h3 className="font-['Playfair_Display'] text-[24px] leading-[32px] font-semibold text-[#2b1611]">
              Password updated
            </h3>
            <p className="font-[#Hanken_Grotesk'] text-[16px] leading-[24px] text-[#564240]">
              Your password has been reset successfully. Redirecting to login...
            </p>
          </header>
          <div className="pt-4">
            <Link
              className="font-['Hanken_Grotesk'] text-[14px] text-[#5b060c] font-bold border-b border-[#5b060c]/30 hover:border-[#5b060c] transition-all inline-flex items-center gap-1"
              href="/app/login"
            >
              Log in now
            </Link>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mb-10 text-center md:text-left">
          <h3 className="font-['Playfair_Display'] text-[24px] leading-[32px] font-semibold text-[#2b1611] mb-2">
            Reset Password
          </h3>
          <p className="text-[#564240] font-['Hanken_Grotesk'] text-[16px] leading-[24px]">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          <input type="hidden" {...register('token')} />

          <div className="space-y-1 group">
            <label
              className="font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold text-[#564240] group-focus-within:text-[#5b060c] group-focus-within:tracking-[0.3em] uppercase tracking-wider transition-all duration-300"
              htmlFor="password"
            >
              New Password
            </label>
            <input
              className="w-full auth-input-underline font-['Hanken_Grotesk'] text-[18px] leading-[28px] text-[#2b1611] placeholder:text-[#ddc0bd] py-2 focus:ring-0"
              id="password"
              placeholder="••••••••"
              type="password"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password?.message && (
              <p className="text-sm text-[#ba1a1a] mt-1">{errors.password.message}</p>
            )}
            <PasswordStrength password={password} />
            <PasswordRequirements password={password} />
          </div>

          <div className="space-y-1 group">
            <label
              className="font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold text-[#564240] group-focus-within:text-[#5b060c] group-focus-within:tracking-[0.3em] uppercase tracking-wider transition-all duration-300"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              className="w-full auth-input-underline font-['Hanken_Grotesk'] text-[18px] leading-[28px] text-[#2b1611] placeholder:text-[#ddc0bd] py-2 focus:ring-0"
              id="confirmPassword"
              placeholder="••••••••"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            <ConfirmPasswordStatus password={password} confirmPassword={confirmPassword} />
          </div>

          {serverError && (
            <p
              className="font-['Hanken_Grotesk'] text-[14px] text-[#ba1a1a] text-center"
              role="alert"
            >
              {serverError}
            </p>
          )}
          {/* Rate limit notice */}
          {isRateLimited && (
            <p
              className="font-['Hanken_Grotesk'] text-[14px] text-[#ba1a1a] text-center"
              role="alert"
            >
              Too many attempts. Please wait {secondsLeft}s before trying again.
            </p>
          )}

          <div className="pt-4">
            <button
              className="w-full bg-[#5b060c] text-white py-4 px-6 font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.2em] font-semibold uppercase shadow-lg hover:shadow-xl hover:bg-[#7a1f1f] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              type="submit"
              disabled={isSubmitting || !passwordReady || isRateLimited}
            >
              <span>{isSubmitting ? 'Updating...' : isRateLimited ? `Try again in ${secondsLeft}s` : 'Reset Password'}</span>
              <IconMapper name="arrow_forward" className="text-sm" />
            </button>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-[#ddc0bd] text-center">
          <Link
            className="font-['Hanken_Grotesk'] text-[14px] text-[#5b060c] font-bold border-b border-[#5b060c]/30 hover:border-[#5b060c] transition-all inline-flex items-center gap-1"
            href="/app/login"
          >
            <IconMapper name="arrow_back" className="text-base" />
            Back to login
          </Link>
        </div>
      </>
    );
  };

  return <AuthCardLayout {...AUTH_PAGE_CONFIGS.resetPassword}>{renderContent()}</AuthCardLayout>;
}

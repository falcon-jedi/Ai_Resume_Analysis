'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRateLimit } from '@/app/app/_hooks/use-rate-limit';

import { loginSchema } from '@/app/api/model/request/auth/auth';
import type { LoginRequest } from '@/app/api/model/request/auth/auth';
import {
  loginClient,
  googleLoginClient,
  getSessionClient,
} from '@/app/api/client/auth/auth-client';
import { AuthCardLayout, AUTH_PAGE_CONFIGS } from '../../_components/auth/auth-card-layout';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { isRateLimited, secondsLeft, triggerRateLimit } = useRateLimit();

  const redirectPath = searchParams.get('redirect') || searchParams.get('callbackUrl');
  const template = searchParams.get('template');
  const explicitTarget = redirectPath
    ? `${redirectPath}${template ? `?template=${template}` : ''}`
    : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    setServerError(null);
    try {
      const result = await loginClient(data);
      if (!result.success) {
        // NextAuth surfaces rate-limit as an error string containing retryAfter
        const retryMatch = result.message?.match(/(\d+)\s*seconds?/i);
        if (
          result.message?.toLowerCase().includes('rate limit') ||
          result.message?.toLowerCase().includes('too many')
        ) {
          const seconds = retryMatch ? parseInt(retryMatch[1], 10) : 900;
          triggerRateLimit(seconds);
          setServerError(null);
          return;
        }
        setServerError(result.message);
        return;
      }
      const session = await getSessionClient();
      const destination =
        explicitTarget || (session?.user?.role === 'ADMIN' ? '/admin' : '/app/dashboard');

      router.push(destination);
      router.refresh();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await googleLoginClient(explicitTarget || '/app/dashboard');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthCardLayout {...AUTH_PAGE_CONFIGS.login}>
      <div className="mb-10 text-center md:text-left">
        <h3 className="font-['Playfair_Display'] text-[24px] leading-[32px] font-semibold text-[#2b1611] mb-2">
          Welcome back
        </h3>
        <p className="text-[#564240] font-['Hanken_Grotesk'] text-[16px] leading-[24px]">
          Continue your professional journey.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
        <div className="space-y-1 group">
          <label
            className="font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold text-[#564240] group-focus-within:text-[#5b060c] group-focus-within:tracking-[0.3em] uppercase tracking-wider transition-all duration-300"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            className="w-full auth-input-underline font-['Hanken_Grotesk'] text-[18px] leading-[28px] text-[#2b1611] placeholder:text-[#ddc0bd] py-2 focus:ring-0"
            id="email"
            placeholder="name@company.com"
            type="email"
            {...register('email')}
          />
          {errors.email?.message && (
            <p className="text-sm text-[#ba1a1a] mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1 group">
          <div className="flex justify-between items-center">
            <label
              className="font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold text-[#564240] group-focus-within:text-[#5b060c] group-focus-within:tracking-[0.3em] uppercase tracking-wider transition-all duration-300"
              htmlFor="password"
            >
              Password
            </label>
            <Link
              className="font-['Hanken_Grotesk'] text-[12px] leading-[16px] font-semibold text-[#5b060c] hover:underline"
              href="/app/forgot-password"
            >
              Forgot?
            </Link>
          </div>
          <input
            className="w-full auth-input-underline font-['Hanken_Grotesk'] text-[18px] leading-[28px] text-[#2b1611] placeholder:text-[#ddc0bd] py-2 focus:ring-0"
            id="password"
            placeholder="••••••••"
            type="password"
            {...register('password')}
          />
          {errors.password?.message && (
            <p className="text-sm text-[#ba1a1a] mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Server-level error */}
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
            Too many login attempts. Please wait {secondsLeft}s before trying again.
          </p>
        )}

        <div className="pt-4">
          <button
            className="w-full bg-[#5b060c] text-white py-4 px-6 font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.2em] font-semibold uppercase shadow-lg hover:shadow-xl hover:bg-[#7a1f1f] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            type="submit"
            disabled={isSubmitting || isRateLimited}
          >
            <span>{isSubmitting ? 'Entering...' : isRateLimited ? `Try again in ${secondsLeft}s` : 'Enter Workshop'}</span>
            <IconMapper name="arrow_forward" className="text-sm" />
          </button>
        </div>
      </form>

      <div className="mt-12 pt-8 border-t border-[#ddc0bd]">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-[12px] leading-[16px] font-medium text-[#564240] tracking-wider uppercase">
            OR CONTINUE WITH
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="p-3 border border-[#ddc0bd] hover:bg-[#fff0ed] transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <IconMapper name="google" className="text-[#2b1611]" />
            </button>
          </div>
          <p className="mt-6 text-[#564240] font-['Hanken_Grotesk'] text-[16px] leading-[24px]">
            New to the workshop?{' '}
            <Link
              className="text-[#5b060c] font-bold border-b border-[#5b060c]/30 hover:border-[#5b060c] transition-all"
              href="/app/signup"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </AuthCardLayout>
  );
}

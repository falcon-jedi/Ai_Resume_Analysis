import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '../../_components/auth/auth-layout';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot Password | JobPatra - AI Career Workshop',
  description: 'Request a password reset link for your JobPatra account.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="text-center py-8 text-[#564240] font-['Hanken_Grotesk']">Loading...</div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}

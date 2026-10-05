import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '../../_components/auth/auth-layout';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = {
  title: 'Reset Password | JobPatra - AI Career Workshop',
  description: 'Set a new password for your JobPatra account.',
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="text-center py-8 text-[#564240] font-['Hanken_Grotesk']">Loading...</div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}

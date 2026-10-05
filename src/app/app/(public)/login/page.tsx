import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '../../_components/auth/auth-layout';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Login | JobPatra - AI Career Workshop',
  description: 'Sign in to your JobPatra account to access your dashboard and active resumes.',
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={<div className="text-center py-8 text-[#564240]">Loading login form...</div>}
      >
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}

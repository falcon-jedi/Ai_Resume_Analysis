import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '../../_components/auth/auth-layout';
import { SignupForm } from './signup-form';

export const metadata: Metadata = {
  title: 'Sign Up | JobPatra - AI Career Workshop',
  description: 'Create your JobPatra account to start building resumes that get results.',
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={<div className="text-center py-8 text-[#564240]">Loading signup form...</div>}
      >
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}

import type { Metadata } from 'next';
import { TermsClient } from '@/app/app/(public)/terms/terms-client';

export const metadata: Metadata = {
  title: 'Terms of Service — JobPatra',
  description:
    'Read the terms and conditions for using JobPatra. Understand user responsibilities, intellectual property ownership, and subscription terms.',
};

export default function TermsPage() {
  return <TermsClient />;
}

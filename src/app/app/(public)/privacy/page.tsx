import type { Metadata } from 'next';
import { PrivacyClient } from '@/app/app/(public)/privacy/privacy-client';

export const metadata: Metadata = {
  title: 'Privacy Policy — JobPatra',
  description:
    'Learn how JobPatra collects, uses, and protects your personal data. Understand your rights and our commitment to privacy and data security.',
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}

import type { Metadata } from 'next';
import { FAQClient } from '@/app/app/(dashboard)/faq/faq-client';

export const metadata: Metadata = {
  title: 'FAQ & Help Center — JobPatra',
  description:
    'Frequently asked questions about JobPatra resume building, ATS scoring, and subscriptions.',
};

export default function FAQPage() {
  return <FAQClient />;
}

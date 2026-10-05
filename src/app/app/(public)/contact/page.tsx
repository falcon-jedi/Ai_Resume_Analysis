import type { Metadata } from 'next';
import { ContactClient } from './contact-client';

export const metadata: Metadata = {
  title: 'Contact Us & Feedback — JobPatra',
  description:
    'Have a question, feature request, or found a bug? Get in touch with the JobPatra team. We read every message and respond promptly.',
};

export default function ContactPage() {
  return <ContactClient />;
}

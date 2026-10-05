import type { Metadata } from 'next';
import TemplatesClient from './templates-client';

export const metadata: Metadata = {
  title: 'JobPatra | Professional Resume Templates Gallery',
  description:
    'Choose from our premium, ATS-optimized, and designer resume templates to craft a professional resume that gets you hired.',
};

export default function TemplatesPage() {
  return <TemplatesClient />;
}

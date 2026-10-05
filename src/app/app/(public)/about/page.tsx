import type { Metadata } from 'next';
import { AboutClient } from '@/app/app/(public)/about/about-client';

export const metadata: Metadata = {
  title: 'About Us — JobPatra | AI Career Workshop',
  description:
    'Learn how JobPatra empowers job seekers across India and beyond to craft ATS-optimized resumes, beat algorithmic filters, and land dream roles.',
};

export default function AboutPage() {
  return <AboutClient />;
}

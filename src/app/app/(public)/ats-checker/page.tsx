import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { AtsPageClient } from './ats-client';

export const metadata: Metadata = {
  title: 'ATS Checker | JobPatra — AI Career Workshop',
  description:
    'Analyze your resume with JobPatra AI. Get instant ATS compatibility scores, keyword matching, formatting analysis, and AI-powered suggestions to land more interviews.',
};

export default async function AtsCheckerPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  return <AtsPageClient isLoggedIn={isLoggedIn} />;
}

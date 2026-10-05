import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { AtsAnalyzerClient } from './ats-analyzer-client';

export const metadata: Metadata = {
  title: 'ATS Analyzer Workshop | JobPatra',
  description:
    'Submit your resume and compare against target job descriptions in the JobPatra ATS Analyzer.',
};

export default async function AtsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/app/login');

  return <AtsAnalyzerClient />;
}

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import ResumeEditorClient from './editor-client';

export const metadata: Metadata = {
  title: 'Resume Editor — Elevate AI',
  description: 'Design and polish your resume with real-time AI and ATS optimization.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResumePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/app/login');

  const { id } = await params;

  return <ResumeEditorClient resumeId={id} />;
}

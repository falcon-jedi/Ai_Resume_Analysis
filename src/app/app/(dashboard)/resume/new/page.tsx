import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import NewResumeClient from './new-client';

export const metadata: Metadata = {
  title: 'Create Resume — JobPatra',
  description: 'Choose a professional template and start building your resume with JobPatra.',
};

export default async function NewResumePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/app/login');

  return <NewResumeClient />;
}

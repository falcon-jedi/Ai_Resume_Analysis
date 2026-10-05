import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import DashboardPageClient from './dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard | JobPatra - AI Career Workshop',
  description: 'Your JobPatra dashboard — manage resumes, ATS analyses, and AI suggestions.',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/app/login');

  const userName = session.user?.name?.split(' ')[0] ?? session.user?.email ?? 'User';

  return <DashboardPageClient userName={userName} />;
}

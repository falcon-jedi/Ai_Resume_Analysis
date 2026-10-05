import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import SettingsClient from './settings-client';

export const metadata: Metadata = {
  title: 'Settings — JobPatra',
  description: 'Manage your account, preferences and subscription.',
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/app/login');
  return <SettingsClient session={session} />;
}

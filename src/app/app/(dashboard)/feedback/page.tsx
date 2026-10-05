import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { FeedbackClient } from './feedback-client';

export const metadata: Metadata = {
  title: 'Share Feedback — JobPatra',
  description:
    'Help us improve JobPatra by sharing your feedback, bug reports, and feature requests.',
};

export default async function FeedbackPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/app/login');

  return <FeedbackClient user={session.user} />;
}

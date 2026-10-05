import type { Metadata } from 'next';
import { NotificationsClient } from '@/app/app/(dashboard)/notifications/notifications-client';

export const metadata: Metadata = {
  title: 'Notifications — JobPatra',
  description:
    'View your recent account activity, ATS score audits, and product updates on JobPatra.',
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}

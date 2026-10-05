import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { BillingClient } from '@/app/app/(dashboard)/billing/billing-client';

export const metadata: Metadata = {
  title: 'Billing & Invoices — JobPatra',
  description: 'View your invoice history and download PDF receipts.',
};

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/app/login');

  return <BillingClient />;
}

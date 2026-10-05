import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { PricingClient } from '../../(public)/pricing/pricing-client';

export const metadata: Metadata = {
  title: 'Upgrade Plan — JobPatra',
  description: 'Select the perfect plan for your career growth.',
};

export default async function ProtectedSubscriptionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/app/login');

  const hdrs = await headers();
  const country = hdrs.get('x-vercel-ip-country') || hdrs.get('cf-ipcountry') || null;
  const currency = country === 'IN' ? ('INR' as const) : ('INR' as const); // default INR for dashboard

  return (
    <div className="h-full overflow-y-auto">
      <PricingClient currency={currency} />
    </div>
  );
}

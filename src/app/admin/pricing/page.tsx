import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { prisma } from '@/app/_lib/prisma';
import { PricingAdminClient } from './pricing-client';

export const metadata: Metadata = { title: 'Pricing Plans | JobPatra Admin' };

export default async function AdminPricingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/app/dashboard');

  const [plans, comparisonFeatures] = await Promise.all([
    prisma.pricingPlan.findMany({
      orderBy: { displayOrder: 'asc' },
      include: { features: { orderBy: { order: 'asc' } } },
    }),
    prisma.comparisonFeature.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, title: true },
    }),
  ]);

  return <PricingAdminClient initialPlans={plans} comparisonFeatures={comparisonFeatures} />;
}

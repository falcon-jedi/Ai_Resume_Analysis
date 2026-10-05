import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { prisma } from '@/app/_lib/prisma';
import { FeaturesAdminClient } from './features-client';

export const metadata: Metadata = { title: 'Feature Ledger | JobPatra Admin' };

export default async function AdminFeaturesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/app/dashboard');

  const [features, plans] = await Promise.all([
    prisma.comparisonFeature.findMany({
      orderBy: { order: 'asc' },
    }),
    prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const serializedFeatures = features.map((f) => ({
    id: f.id,
    title: f.title,
    values: (f.values as Record<string, string>) || {},
    order: f.order,
  }));

  return <FeaturesAdminClient initialFeatures={serializedFeatures} plans={plans} />;
}

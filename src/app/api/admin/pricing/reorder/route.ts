import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { withAdminAuth } from '../../_lib/with-admin-auth';
import { invalidatePlanLimitsCache } from '@/app/service/subscription/plan-limit.service';
import { invalidatePricingCache } from '@/app/service/pricing/pricing.service';
import type { ReorderPricingPlansRequest } from '@/app/api/model/request/pricing/pricing';

export async function PUT(request: Request) {
  const result = await withAdminAuth();
  if (result instanceof NextResponse) return result;

  const { orders } = (await request.json()) as ReorderPricingPlansRequest;

  await prisma.$transaction(
    orders.map(({ id, displayOrder }) =>
      prisma.pricingPlan.update({ where: { id }, data: { displayOrder } }),
    ),
  );

  void invalidatePlanLimitsCache();
  void invalidatePricingCache();
  return NextResponse.json({ success: true });
}

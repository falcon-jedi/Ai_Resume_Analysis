import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { withAdminAuth } from '../_lib/with-admin-auth';
import { invalidatePlanLimitsCache } from '@/app/service/subscription/plan-limit.service';
import { invalidatePricingCache } from '@/app/service/pricing/pricing.service';
import type {
  CreatePricingPlanRequest,
  UpdatePricingPlanRequest,
} from '@/app/api/model/request/pricing/pricing';

export async function GET() {
  const result = await withAdminAuth();
  if (result instanceof NextResponse) return result;
  const data = await prisma.pricingPlan.findMany({
    orderBy: { displayOrder: 'asc' },
    include: { features: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const result = await withAdminAuth();
  if (result instanceof NextResponse) return result;

  const body = (await request.json()) as CreatePricingPlanRequest;

  const plan = await prisma.pricingPlan.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      buttonText: body.buttonText ?? 'Get Started',
      priceInr: body.priceInr,
      priceUsd: body.priceUsd,
      currency: body.currency ?? 'INR',
      templateAccess: body.templateAccess ?? 'FREE',
      durationDays: body.durationDays ?? null,
      limitAtsAnalysis: body.limitAtsAnalysis,
      limitAiSuggestion: body.limitAiSuggestion,
      isPopular: body.isPopular ?? false,
      displayOrder: body.displayOrder ?? 0,
      isActive: true,
      features: {
        create: (body.features ?? []).map((f, i) => ({
          feature: f.feature,
          available: f.available,
          highlight: f.highlight ?? false,
          order: f.order ?? i,
        })),
      },
    },
    include: { features: true },
  });

  void invalidatePlanLimitsCache();
  void invalidatePricingCache();
  return NextResponse.json({ success: true, data: plan }, { status: 201 });
}

export async function PUT(request: Request) {
  const result = await withAdminAuth();
  if (result instanceof NextResponse) return result;

  const body = (await request.json()) as UpdatePricingPlanRequest;

  if (body.features !== undefined) {
    await prisma.$transaction([
      prisma.planFeature.deleteMany({ where: { planId: body.id } }),
      prisma.planFeature.createMany({
        data: body.features.map((f, i) => ({
          planId: body.id,
          feature: f.feature,
          available: f.available ?? true,
          highlight: f.highlight ?? false,
          order: f.order ?? i,
        })),
      }),
    ]);
  }

  const plan = await prisma.pricingPlan.update({
    where: { id: body.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.buttonText !== undefined && { buttonText: body.buttonText }),
      ...(body.priceInr !== undefined && { priceInr: body.priceInr }),
      ...(body.priceUsd !== undefined && { priceUsd: body.priceUsd }),
      ...(body.currency !== undefined && { currency: body.currency }),
      ...(body.templateAccess !== undefined && { templateAccess: body.templateAccess }),
      ...(body.durationDays !== undefined && { durationDays: body.durationDays }),
      ...(body.limitAtsAnalysis !== undefined && { limitAtsAnalysis: body.limitAtsAnalysis }),
      ...(body.limitAiSuggestion !== undefined && { limitAiSuggestion: body.limitAiSuggestion }),
      ...(body.isPopular !== undefined && { isPopular: body.isPopular }),
      ...(body.displayOrder !== undefined && { displayOrder: body.displayOrder }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
    include: { features: { orderBy: { order: 'asc' } } },
  });

  void invalidatePlanLimitsCache();
  void invalidatePricingCache();
  return NextResponse.json({ success: true, data: plan });
}

export async function DELETE(request: Request) {
  const result = await withAdminAuth();
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, message: 'id required' }, { status: 400 });

  await prisma.pricingPlan.delete({ where: { id } });
  void invalidatePlanLimitsCache();
  void invalidatePricingCache();
  return NextResponse.json({ success: true });
}

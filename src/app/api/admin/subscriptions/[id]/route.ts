import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { withAdminAuth } from '@/app/api/admin/_lib/with-admin-auth';
import { logAdminAction } from '@/app/api/admin/_lib/log-admin-action';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!subscription) {
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ subscription });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = (await request.json()) as {
    plan?: string;
    status?: string;
    currentPeriodEnd?: string;
  };

  const before = await prisma.subscription.findUnique({
    where: { id },
    select: { plan: true, status: true, currentPeriodEnd: true },
  });

  const normalizedPlan = body.plan ? body.plan.toUpperCase() : undefined;
  let planSnapshotUpdate = {};
  if (normalizedPlan) {
    const p = await prisma.pricingPlan.findUnique({
      where: { slug: normalizedPlan.toLowerCase() },
    });
    if (p) {
      planSnapshotUpdate = {
        snapshotPlanName: p.name,
        snapshotTemplateAccess: p.templateAccess,
        snapshotDurationDays: p.durationDays,
        snapshotLimitAts: p.limitAtsAnalysis,
        snapshotLimitAi: p.limitAiSuggestion,
      };
    }
  }

  const updated = await prisma.subscription.update({
    where: { id },
    data: {
      ...(normalizedPlan != null ? { plan: normalizedPlan, ...planSnapshotUpdate } : {}),
      ...(body.status != null ? { status: body.status } : {}),
      ...(body.currentPeriodEnd !== undefined
        ? { currentPeriodEnd: body.currentPeriodEnd ? new Date(body.currentPeriodEnd) : null }
        : {}),
    },
  });

  await logAdminAction({
    adminId: auth.session.user.id,
    action: 'UPDATE_SUBSCRIPTION',
    target: id,
    details: { before, after: body },
    request,
  });

  return NextResponse.json({ success: true, subscription: updated });
}

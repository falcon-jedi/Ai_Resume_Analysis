import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { withAdminAuth } from '@/app/api/admin/_lib/with-admin-auth';
import { logAdminAction } from '@/app/api/admin/_lib/log-admin-action';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      jobTitle: true,
      industry: true,
      createdAt: true,
      subscription: true,
      usageTracking: true,
      resumes: {
        select: { id: true, title: true, templateId: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      },
      atsAnalyses: {
        select: { id: true, overallScore: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { resumes: true, atsAnalyses: true, payments: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id: userId } = await params;
  const body = (await request.json()) as {
    atsLimit?: number;
    atsUsed?: number;
    aiLimit?: number;
    aiUsed?: number;
  };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, usageTracking: true },
  });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  const now = new Date();

  // Update ATS if provided
  if (body.atsLimit !== undefined || body.atsUsed !== undefined) {
    await prisma.usageTracking.upsert({
      where: { userId_feature: { userId, feature: 'ATS_ANALYSIS' } },
      update: {
        ...(body.atsLimit !== undefined ? { limit: Math.max(0, Number(body.atsLimit)) } : {}),
        ...(body.atsUsed !== undefined ? { used: Math.max(0, Number(body.atsUsed)) } : {}),
        updatedAt: now,
      },
      create: {
        userId,
        feature: 'ATS_ANALYSIS',
        limit: body.atsLimit !== undefined ? Math.max(0, Number(body.atsLimit)) : 0,
        used: body.atsUsed !== undefined ? Math.max(0, Number(body.atsUsed)) : 0,
        lastResetDate: now,
      },
    });
  }

  // Update AI if provided
  if (body.aiLimit !== undefined || body.aiUsed !== undefined) {
    await prisma.usageTracking.upsert({
      where: { userId_feature: { userId, feature: 'AI_SUGGESTION' } },
      update: {
        ...(body.aiLimit !== undefined ? { limit: Math.max(0, Number(body.aiLimit)) } : {}),
        ...(body.aiUsed !== undefined ? { used: Math.max(0, Number(body.aiUsed)) } : {}),
        updatedAt: now,
      },
      create: {
        userId,
        feature: 'AI_SUGGESTION',
        limit: body.aiLimit !== undefined ? Math.max(0, Number(body.aiLimit)) : 0,
        used: body.aiUsed !== undefined ? Math.max(0, Number(body.aiUsed)) : 0,
        lastResetDate: now,
      },
    });
  }

  await logAdminAction({
    adminId: auth.session.user.id,
    action: 'UPDATE_USER_CREDITS',
    target: userId,
    details: { before: user.usageTracking, after: body },
    request,
  });

  return NextResponse.json({ success: true });
}

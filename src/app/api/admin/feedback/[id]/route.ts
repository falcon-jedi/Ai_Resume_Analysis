import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { withAdminAuth } from '@/app/api/admin/_lib/with-admin-auth';
import { logAdminAction } from '@/app/api/admin/_lib/log-admin-action';

const VALID_STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json();
  const { status } = body as { status: string };

  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
  }

  const before = await prisma.feedback.findUnique({ where: { id }, select: { status: true } });
  const updated = await prisma.feedback.update({ where: { id }, data: { status } });

  await logAdminAction({
    adminId: auth.session.user.id,
    action: 'UPDATE_FEEDBACK_STATUS',
    target: id,
    details: { before: before?.status, after: status },
    request,
  });

  return NextResponse.json({ success: true, feedback: updated });
}

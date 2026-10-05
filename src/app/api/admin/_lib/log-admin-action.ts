import { Prisma } from '@prisma/client';
import { prisma } from '@/app/_lib/prisma';

interface LogAdminActionParams {
  adminId: string;
  action: string;
  target?: string;
  details: Record<string, unknown>;
  request?: Request;
}

/**
 * Writes an audit log entry for a sensitive admin action.
 * Fire-and-forget safe — errors are logged but never thrown.
 */
export async function logAdminAction({
  adminId,
  action,
  target,
  details,
  request,
}: LogAdminActionParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        target,
        details: details as Prisma.InputJsonValue,
        ipAddress: request?.headers.get('x-forwarded-for') ?? undefined,
        userAgent: request?.headers.get('user-agent') ?? undefined,
      },
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write audit log:', err);
  }
}

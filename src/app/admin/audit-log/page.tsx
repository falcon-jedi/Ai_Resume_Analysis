import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { prisma } from '@/app/_lib/prisma';

export const metadata: Metadata = { title: 'Audit Log | JobPatra Admin' };

const PAGE_SIZE = 50;

const ACTION_BADGE: Record<string, string> = {
  DELETE_USER: 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]',
  UPDATE_SUBSCRIPTION: 'bg-[#e0f2fe] text-[#0369a1] border border-[#7dd3fc]',
  UPDATE_FEEDBACK_STATUS: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
  RESEND_INVOICE_EMAIL: 'bg-[#dcfce7] text-[#166534] border border-[#86efac]',
  CREATE_PRICING_PLAN: 'bg-[#f3e8ff] text-[#6b21a8] border border-[#d8b4fe]',
  UPDATE_PRICING_PLAN: 'bg-[#f3e8ff] text-[#6b21a8] border border-[#d8b4fe]',
  DELETE_PRICING_PLAN: 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]',
};

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/app/dashboard');

  const { page: pageStr = '1' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  return (
    <div className="space-y-4 font-['Hanken_Grotesk']">
      <p className="text-xs font-semibold text-[#564240]">
        {total} recorded administrative actions
      </p>
      <div className="bg-white border border-[#ddc0bd] rounded-xl divide-y divide-[#ddc0bd]/50 shadow-xs overflow-hidden">
        {logs.length === 0 && (
          <p className="px-5 py-8 text-sm text-[#564240] text-center">
            No audit trail entries found.
          </p>
        )}
        {logs.map((log) => (
          <div
            key={log.id}
            className="px-5 py-4 flex items-start gap-4 hover:bg-[#fff8f6]/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${ACTION_BADGE[log.action] ?? 'bg-[#fff0ed] text-[#564240]'}`}
                >
                  {log.action}
                </span>
                {log.target && (
                  <span className="text-[11px] text-[#7a1f1f] font-mono font-medium">
                    Target: {log.target}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#564240] font-medium">
                Admin:{' '}
                <strong className="text-[#2b1611]">{log.admin.name ?? log.admin.email}</strong> ·{' '}
                {new Date(log.createdAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {log.details && Object.keys(log.details as object).length > 0 && (
                <pre className="mt-2.5 text-xs text-[#2b1611] bg-[#fff8f6] border border-[#ddc0bd]/60 rounded-xl p-3 overflow-x-auto font-mono shadow-2xs">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>

      {Math.ceil(total / PAGE_SIZE) > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {page > 1 && (
            <a
              href={`/admin/audit-log?page=${page - 1}`}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#ddc0bd] text-[#564240] hover:text-[#2b1611] hover:bg-[#fff0ed] transition-colors shadow-2xs"
            >
              ← Prev
            </a>
          )}
          {page < Math.ceil(total / PAGE_SIZE) && (
            <a
              href={`/admin/audit-log?page=${page + 1}`}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#ddc0bd] text-[#564240] hover:text-[#2b1611] hover:bg-[#fff0ed] transition-colors shadow-2xs"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

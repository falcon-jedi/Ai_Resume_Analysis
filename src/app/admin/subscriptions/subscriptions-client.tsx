'use client';

import { useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Pagination } from '@/app/app/_components/ui/pagination';

interface Sub {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  snapshotPlanName: string | null;
  snapshotBillingPeriod: string | null;
  snapshotPriceInr: number | null;
  snapshotCurrency: string | null;
  user: { id: string; name: string | null; email: string };
  createdAt: string;
  updatedAt: string;
}

interface Props {
  initialSubs: Sub[];
  total: number;
  page: number;
  totalPages: number;
  initialStatus: string;
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-[#dcfce7] text-[#166534] border border-[#86efac]',
  EXPIRED: 'bg-[#f3f4f6] text-[#4b5563] border border-[#d1d5db]',
  CANCELLED: 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]',
  TRIALING: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
};
const STATUSES = ['', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'TRIALING'];
const PLAN_BADGE: Record<string, string> = {
  FREE: 'bg-[#fff0ed] text-[#564240] border border-[#ddc0bd]/60',
  PLUS: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
  PRO: 'bg-[#dcfce7] text-[#166534] border border-[#86efac]',
  ENTERPRISE: 'bg-[#e0f2fe] text-[#0369a1] border border-[#7dd3fc]',
};

export function AdminSubscriptionsClient({
  initialSubs,
  total,
  page,
  totalPages,
  initialStatus,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (status: string, newPage: number) => {
      const p = new URLSearchParams();
      if (status) p.set('status', status);
      if (newPage > 1) p.set('page', String(newPage));
      startTransition(() => router.push(`/admin/subscriptions?${p.toString()}`));
    },
    [router],
  );

  const fmt = (n: number, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-4 font-['Hanken_Grotesk']">
      <div className="flex gap-3 flex-wrap">
        <select
          defaultValue={initialStatus}
          onChange={(e) => navigate(e.target.value, 1)}
          className="px-4 py-2.5 text-sm bg-white border border-[#ddc0bd] rounded-xl text-[#2b1611] focus:outline-none focus:border-[#7a1f1f] shadow-xs"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || 'All Statuses'}
            </option>
          ))}
        </select>
        <p className="py-2 text-xs font-semibold text-[#564240] self-center">
          {total} total subscriptions{isPending ? ' — loading…' : ''}
        </p>
      </div>

      <div className="bg-white border border-[#ddc0bd] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ddc0bd] bg-[#fff8f6] text-[#564240] text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3.5 font-bold">User</th>
                <th className="text-left px-5 py-3.5 font-bold">Plan</th>
                <th className="text-left px-5 py-3.5 font-bold">Status</th>
                <th className="text-left px-5 py-3.5 font-bold hidden md:table-cell">Period End</th>
                <th className="text-left px-5 py-3.5 font-bold hidden lg:table-cell">Amount</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ddc0bd]/50">
              {initialSubs.map((s) => (
                <tr key={s.id} className="hover:bg-[#fff0ed]/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-[#2b1611]">{s.user.name ?? '—'}</p>
                    <p className="text-xs text-[#564240] mt-0.5">{s.user.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${PLAN_BADGE[s.plan] ?? PLAN_BADGE.FREE}`}
                    >
                      {s.snapshotPlanName ?? s.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_BADGE[s.status] ?? ''}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#564240] text-xs font-medium hidden md:table-cell">
                    {s.currentPeriodEnd
                      ? new Date(s.currentPeriodEnd).toLocaleDateString('en-IN')
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-[#2b1611] font-bold hidden lg:table-cell">
                    {s.snapshotPriceInr != null
                      ? fmt(s.snapshotPriceInr, s.snapshotCurrency ?? 'INR')
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/subscriptions/${s.id}`}
                      className="p-1.5 rounded-lg hover:bg-[#fff0ed] text-[#564240] hover:text-[#7a1f1f] transition-colors inline-flex"
                      title="Manage Subscription"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-[#ddc0bd] px-5 py-3.5 bg-[#fff8f6]/50">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => navigate(initialStatus, p)}
            variant="simple"
          />
        </div>
      </div>
    </div>
  );
}

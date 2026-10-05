'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ExternalLink, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from '@/app/app/_components/ui/pagination';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  subscription: { plan: string; status: string } | null;
  _count: { resumes: number; atsAnalyses: number };
}

interface Props {
  initialUsers: User[];
  total: number;
  page: number;
  totalPages: number;
  initialQ: string;
  initialPlan: string;
}

const PLAN_BADGE: Record<string, string> = {
  FREE: 'bg-[#fff0ed] text-[#564240] border border-[#ddc0bd]/60',
  PRO: 'bg-[#dcfce7] text-[#166534] border border-[#86efac]',
  ENTERPRISE: 'bg-[#e0f2fe] text-[#0369a1] border border-[#7dd3fc]',
};

const PLANS = ['', 'FREE', 'PRO', 'ENTERPRISE'];

export function AdminUsersClient({
  initialUsers,
  total,
  page,
  totalPages,
  initialQ,
  initialPlan,
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [plan, setPlan] = useState(initialPlan);
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (newQ: string, newPlan: string, newPage: number) => {
      const params = new URLSearchParams();
      if (newQ) params.set('q', newQ);
      if (newPlan) params.set('plan', newPlan);
      if (newPage > 1) params.set('page', String(newPage));
      startTransition(() => router.push(`/admin/users?${params.toString()}`));
    },
    [router],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q, plan, 1);
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This action cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('User deleted');
      router.refresh();
    } else {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-4 font-['Hanken_Grotesk']">
      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#564240]" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#ddc0bd] rounded-xl text-[#2b1611] placeholder-[#564240]/60 focus:outline-none focus:border-[#7a1f1f] focus:ring-1 focus:ring-[#7a1f1f]/20 shadow-xs"
          />
        </div>
        <select
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value);
            navigate(q, e.target.value, 1);
          }}
          className="px-4 py-2.5 text-sm bg-white border border-[#ddc0bd] rounded-xl text-[#2b1611] focus:outline-none focus:border-[#7a1f1f] shadow-xs"
        >
          {PLANS.map((p) => (
            <option key={p} value={p}>
              {p || 'All Plans'}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm bg-[#5b060c] hover:bg-[#7a1f1f] text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      <p className="text-xs font-semibold text-[#564240]">
        {total.toLocaleString()} users registered{isPending ? ' — loading…' : ''}
      </p>

      {/* Table */}
      <div className="bg-white border border-[#ddc0bd] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ddc0bd] bg-[#fff8f6] text-[#564240] text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3.5 font-bold">User</th>
                <th className="text-left px-5 py-3.5 font-bold hidden sm:table-cell">Plan</th>
                <th className="text-left px-5 py-3.5 font-bold hidden lg:table-cell">Resumes</th>
                <th className="text-left px-5 py-3.5 font-bold hidden lg:table-cell">
                  ATS Analyses
                </th>
                <th className="text-left px-5 py-3.5 font-bold hidden md:table-cell">Joined</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ddc0bd]/50">
              {initialUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#fff0ed]/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-[#2b1611]">{user.name ?? '—'}</p>
                    <p className="text-xs text-[#564240] mt-0.5">{user.email}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${PLAN_BADGE[user.subscription?.plan ?? 'FREE'] ?? PLAN_BADGE.FREE}`}
                    >
                      {user.subscription?.plan ?? 'FREE'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#564240] font-medium hidden lg:table-cell">
                    {user._count.resumes}
                  </td>
                  <td className="px-5 py-3.5 text-[#564240] font-medium hidden lg:table-cell">
                    {user._count.atsAnalyses}
                  </td>
                  <td className="px-5 py-3.5 text-[#564240] text-xs hidden md:table-cell">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="p-1.5 rounded-lg hover:bg-[#fff0ed] text-[#564240] hover:text-[#7a1f1f] transition-colors"
                        title="View details"
                      >
                        <ExternalLink size={16} />
                      </Link>
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          className="p-1.5 rounded-lg hover:bg-[#fee2e2] text-[#564240] hover:text-[#991b1b] transition-colors cursor-pointer"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
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
            onPageChange={(p) => navigate(q, plan, p)}
            variant="simple"
          />
        </div>
      </div>
    </div>
  );
}

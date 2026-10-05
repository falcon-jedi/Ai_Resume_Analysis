'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Pagination } from '@/app/app/_components/ui/pagination';

interface Feedback {
  id: string;
  type: string;
  status: string;
  subject: string | null;
  message: string;
  rating: number | null;
  createdAt: string;
  name: string | null;
  email: string | null;
  user: { id: string; name: string | null; email: string } | null;
}

interface Props {
  initialFeedbacks: Feedback[];
  total: number;
  page: number;
  totalPages: number;
  initialType: string;
  initialStatus: string;
}

const TYPE_BADGE: Record<string, string> = {
  BUG: 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]',
  FEATURE: 'bg-[#e0f2fe] text-[#0369a1] border border-[#7dd3fc]',
  GENERAL: 'bg-[#f3f4f6] text-[#4b5563] border border-[#d1d5db]',
  COMPLIMENT: 'bg-[#dcfce7] text-[#166534] border border-[#86efac]',
};

const STATUS_BADGE: Record<string, string> = {
  NEW: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
  IN_PROGRESS: 'bg-[#e0f2fe] text-[#0369a1] border border-[#7dd3fc]',
  RESOLVED: 'bg-[#dcfce7] text-[#166534] border border-[#86efac]',
  CLOSED: 'bg-[#f3f4f6] text-[#4b5563] border border-[#d1d5db]',
};

const STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const TYPES = ['', 'BUG', 'FEATURE', 'GENERAL', 'COMPLIMENT'];
const ALL_STATUSES = ['', ...STATUSES];

export function AdminFeedbackClient({
  initialFeedbacks,
  total,
  page,
  totalPages,
  initialType,
  initialStatus,
}: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (type: string, status: string, newPage: number) => {
      const p = new URLSearchParams();
      if (type) p.set('type', type);
      if (status) p.set('status', status);
      if (newPage > 1) p.set('page', String(newPage));
      startTransition(() => router.push(`/admin/feedback?${p.toString()}`));
    },
    [router],
  );

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const res = await fetch(`/api/admin/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    if (res.ok) {
      toast.success('Status updated');
      router.refresh();
    } else {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-4 font-['Hanken_Grotesk']">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          defaultValue={initialType}
          onChange={(e) => navigate(e.target.value, initialStatus, 1)}
          className="px-4 py-2.5 text-sm bg-white border border-[#ddc0bd] rounded-xl text-[#2b1611] focus:outline-none focus:border-[#7a1f1f] shadow-xs"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t || 'All Types'}
            </option>
          ))}
        </select>
        <select
          defaultValue={initialStatus}
          onChange={(e) => navigate(initialType, e.target.value, 1)}
          className="px-4 py-2.5 text-sm bg-white border border-[#ddc0bd] rounded-xl text-[#2b1611] focus:outline-none focus:border-[#7a1f1f] shadow-xs"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || 'All Statuses'}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs font-semibold text-[#564240]">
        {total} feedback items{isPending ? ' — loading…' : ''}
      </p>

      {/* List */}
      <div className="bg-white border border-[#ddc0bd] rounded-xl divide-y divide-[#ddc0bd]/50 shadow-xs overflow-hidden">
        {initialFeedbacks.length === 0 && (
          <p className="px-5 py-8 text-sm text-[#564240] text-center">
            No feedback submissions found.
          </p>
        )}
        {initialFeedbacks.map((fb) => {
          const authorName = fb.user?.name ?? fb.name ?? 'Anonymous User';
          const authorEmail = fb.user?.email ?? fb.email ?? '';
          const isExpanded = expanded === fb.id;
          return (
            <div key={fb.id} className="p-5 hover:bg-[#fff8f6]/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${TYPE_BADGE[fb.type] ?? ''}`}
                    >
                      {fb.type}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_BADGE[fb.status] ?? ''}`}
                    >
                      {fb.status}
                    </span>
                    {fb.rating != null && (
                      <span className="text-xs text-[#92400e] font-bold">
                        {'★'.repeat(fb.rating)}
                        {'☆'.repeat(5 - fb.rating)}
                      </span>
                    )}
                  </div>
                  <p className="text-base font-bold text-[#2b1611] font-['Playfair_Display']">
                    {fb.subject || '(No subject provided)'}
                  </p>
                  <p className="text-xs text-[#564240] mt-1 font-medium">
                    {authorName} {authorEmail && `· ${authorEmail}`} ·{' '}
                    {new Date(fb.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Inline status updater */}
                  <div className="relative">
                    <select
                      value={fb.status}
                      onChange={(e) => updateStatus(fb.id, e.target.value)}
                      disabled={updating === fb.id}
                      className="appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold bg-white border border-[#ddc0bd] rounded-lg text-[#2b1611] focus:outline-none focus:border-[#7a1f1f] disabled:opacity-50 shadow-2xs cursor-pointer"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#564240] pointer-events-none"
                    />
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : fb.id)}
                    className="text-xs font-semibold text-[#7a1f1f] hover:bg-[#fff0ed] px-3 py-1.5 rounded-lg border border-[#ddc0bd]/60 transition-colors cursor-pointer"
                  >
                    {isExpanded ? 'Collapse' : 'Read Message'}
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div className="mt-4 p-4 bg-[#fff8f6] border border-[#ddc0bd]/60 rounded-xl text-sm text-[#2b1611] leading-relaxed whitespace-pre-wrap shadow-2xs">
                  {fb.message}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="pt-2">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => navigate(initialType, initialStatus, p)}
          variant="simple"
        />
      </div>
    </div>
  );
}

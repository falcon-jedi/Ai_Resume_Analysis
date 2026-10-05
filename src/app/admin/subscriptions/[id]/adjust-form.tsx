'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Props {
  subscriptionId: string;
  currentPlan: string;
  currentStatus: string;
  currentPeriodEnd: string;
  availablePlans: Array<{ value: string; label: string }>;
  availableStatuses: string[];
}

export function SubscriptionAdjustForm({
  subscriptionId,
  currentPlan,
  currentStatus,
  currentPeriodEnd,
  availablePlans,
  availableStatuses,
}: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState((currentPlan || 'FREE').toUpperCase());
  const [status, setStatus] = useState(currentStatus);
  const [periodEnd, setPeriodEnd] = useState(currentPeriodEnd ? currentPeriodEnd.slice(0, 10) : '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: plan.toUpperCase(),
        status,
        ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd).toISOString() } : {}),
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Subscription updated successfully');
      router.refresh();
    } else {
      toast.error('Failed to update subscription');
    }
  };

  return (
    <div className="bg-white border border-[#ddc0bd] rounded-xl p-6 shadow-xs font-['Hanken_Grotesk']">
      <h2 className="text-xl font-bold text-[#2b1611] font-['Playfair_Display'] mb-4">
        Manual Adjustment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#564240] mb-1.5 font-bold uppercase tracking-wider">
              Plan
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white border border-[#ddc0bd] rounded-xl text-[#2b1611] focus:outline-none focus:border-[#7a1f1f] shadow-xs cursor-pointer"
            >
              {availablePlans.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#564240] mb-1.5 font-bold uppercase tracking-wider">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white border border-[#ddc0bd] rounded-xl text-[#2b1611] focus:outline-none focus:border-[#7a1f1f] shadow-xs cursor-pointer"
            >
              {availableStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#564240] mb-1.5 font-bold uppercase tracking-wider">
            Period End Date
          </label>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-white border border-[#ddc0bd] rounded-xl text-[#2b1611] focus:outline-none focus:border-[#7a1f1f] shadow-xs"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 text-sm bg-[#5b060c] hover:bg-[#7a1f1f] disabled:opacity-50 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
        >
          {saving ? 'Applying…' : 'Apply Changes'}
        </button>
      </form>
      <p className="text-xs text-[#564240] mt-3 font-medium">
        ⚠️ This administrative action is recorded in the Audit Log.
      </p>
    </div>
  );
}

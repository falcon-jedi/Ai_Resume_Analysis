'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Props {
  userId: string;
  initialAtsUsed: number;
  initialAtsLimit: number;
  initialAiUsed: number;
  initialAiLimit: number;
}

export function UserCreditsCard({
  userId,
  initialAtsUsed,
  initialAtsLimit,
  initialAiUsed,
  initialAiLimit,
}: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [atsLimit, setAtsLimit] = useState(initialAtsLimit);
  const [atsUsed, setAtsUsed] = useState(initialAtsUsed);
  const [aiLimit, setAiLimit] = useState(initialAiLimit);
  const [aiUsed, setAiUsed] = useState(initialAiUsed);

  const handleResetForm = () => {
    setAtsLimit(initialAtsLimit);
    setAtsUsed(initialAtsUsed);
    setAiLimit(initialAiLimit);
    setAiUsed(initialAiUsed);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atsLimit: Number(atsLimit),
          atsUsed: Number(atsUsed),
          aiLimit: Number(aiLimit),
          aiUsed: Number(aiUsed),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update credits');
      }

      toast.success('User credits updated successfully');
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error updating user credits');
    } finally {
      setSaving(false);
    }
  };

  const atsRemaining = Math.max(0, initialAtsLimit - initialAtsUsed);
  const aiRemaining = Math.max(0, initialAiLimit - initialAiUsed);

  const atsPercent =
    initialAtsLimit > 0 ? Math.min(100, Math.round((initialAtsUsed / initialAtsLimit) * 100)) : 0;
  const aiPercent =
    initialAiLimit > 0 ? Math.min(100, Math.round((initialAiUsed / initialAiLimit) * 100)) : 0;

  return (
    <div className="bg-white border border-[#ddc0bd] rounded-xl p-5 shadow-xs font-['Hanken_Grotesk']">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-base font-bold text-[#2b1611] font-['Playfair_Display']">
            Usage & Credits
          </p>
          <p className="text-xs text-[#564240]">
            ATS scans and AI optimization credits allocated to this user.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-[#fff0ed] text-[#5b060c] border border-[#ddc0bd] rounded-lg hover:bg-[#ffe2db] transition cursor-pointer"
          >
            ✏️ Edit Credits
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          {/* ATS Metric */}
          <div className="p-3.5 bg-[#fff8f6] border border-[#ddc0bd]/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#2b1611]">ATS Analyses</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7]">
                {atsRemaining} credits remaining
              </span>
            </div>
            <div className="w-full bg-[#eee3e1] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#5b060c] h-2 rounded-full transition-all"
                style={{ width: `${atsPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#564240]">
              <span>
                Used: <strong>{initialAtsUsed}</strong>
              </span>
              <span>
                Total Limit: <strong>{initialAtsLimit}</strong>
              </span>
            </div>
          </div>

          {/* AI Metric */}
          <div className="p-3.5 bg-[#fff8f6] border border-[#ddc0bd]/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#2b1611]">AI Suggestions</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7]">
                {aiRemaining} credits remaining
              </span>
            </div>
            <div className="w-full bg-[#eee3e1] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#7a1f1f] h-2 rounded-full transition-all"
                style={{ width: `${aiPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#564240]">
              <span>
                Used: <strong>{initialAiUsed}</strong>
              </span>
              <span>
                Total Limit: <strong>{initialAiLimit}</strong>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Credits Form */
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div className="p-3.5 bg-[#fff8f6] border border-[#ddc0bd]/80 rounded-xl space-y-3">
            <p className="text-xs font-bold text-[#5b060c] uppercase tracking-wider">
              ATS Analyses Allocation
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#564240] mb-1">
                  Total Limit
                </label>
                <input
                  type="number"
                  min="0"
                  value={atsLimit}
                  onChange={(e) => setAtsLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#ddc0bd] rounded-lg text-[#2b1611] focus:outline-none focus:border-[#5b060c]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#564240] mb-1">
                  Scans Used
                </label>
                <input
                  type="number"
                  min="0"
                  value={atsUsed}
                  onChange={(e) => setAtsUsed(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#ddc0bd] rounded-lg text-[#2b1611] focus:outline-none focus:border-[#5b060c]"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAtsLimit((prev) => prev + 10)}
                className="px-2 py-1 text-[11px] bg-white border border-[#ddc0bd] rounded hover:bg-[#fff0ed] text-[#5b060c]"
              >
                +10 Credits
              </button>
              <button
                type="button"
                onClick={() => setAtsUsed(0)}
                className="px-2 py-1 text-[11px] bg-white border border-[#ddc0bd] rounded hover:bg-[#fff0ed] text-[#564240]"
              >
                Reset Used to 0
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-[#fff8f6] border border-[#ddc0bd]/80 rounded-xl space-y-3">
            <p className="text-xs font-bold text-[#5b060c] uppercase tracking-wider">
              AI Suggestions Allocation
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#564240] mb-1">
                  Total Limit
                </label>
                <input
                  type="number"
                  min="0"
                  value={aiLimit}
                  onChange={(e) => setAiLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#ddc0bd] rounded-lg text-[#2b1611] focus:outline-none focus:border-[#5b060c]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#564240] mb-1">
                  Suggestions Used
                </label>
                <input
                  type="number"
                  min="0"
                  value={aiUsed}
                  onChange={(e) => setAiUsed(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#ddc0bd] rounded-lg text-[#2b1611] focus:outline-none focus:border-[#5b060c]"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAiLimit((prev) => prev + 10)}
                className="px-2 py-1 text-[11px] bg-white border border-[#ddc0bd] rounded hover:bg-[#fff0ed] text-[#5b060c]"
              >
                +10 Credits
              </button>
              <button
                type="button"
                onClick={() => setAiUsed(0)}
                className="px-2 py-1 text-[11px] bg-white border border-[#ddc0bd] rounded hover:bg-[#fff0ed] text-[#564240]"
              >
                Reset Used to 0
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold bg-[#5b060c] hover:bg-[#7a1f1f] text-white rounded-lg disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2 text-xs font-semibold border border-[#ddc0bd] rounded-lg text-[#564240] hover:bg-[#fff0ed] transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

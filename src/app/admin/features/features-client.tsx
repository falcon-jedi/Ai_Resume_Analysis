'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FeatureItem {
  id: string;
  title: string;
  values: Record<string, string>;
  order: number;
}

interface PlanOption {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  initialFeatures: FeatureItem[];
  plans: PlanOption[];
}

const INPUT_CLS =
  'w-full bg-[#fff8f6] border border-[#ddc0bd] rounded-lg px-3 py-2 text-sm text-[#2b1611] placeholder:text-[#cba89d] focus:outline-none focus:ring-2 focus:ring-[#5b060c]/30 transition';
const LABEL_CLS = 'block text-xs font-semibold text-[#564240] mb-1 uppercase tracking-wide';

export function FeaturesAdminClient({ initialFeatures, plans }: Props) {
  const [features, setFeatures] = useState<FeatureItem[]>(initialFeatures);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const startCreate = () => {
    setTitle('');
    const initialVals: Record<string, string> = {};
    plans.forEach((p) => {
      initialVals[p.slug] = 'check';
    });
    setValues(initialVals);
    setEditingId(null);
    setIsFormOpen(true);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (feat: FeatureItem) => {
    setTitle(feat.title);
    const initialVals: Record<string, string> = {};
    plans.forEach((p) => {
      initialVals[p.slug] = feat.values[p.slug] ?? '—';
    });
    setValues(initialVals);
    setEditingId(feat.id);
    setIsFormOpen(true);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitle('');
    setValues({});
    setEditingId(null);
    setIsFormOpen(false);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Feature title is required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        title: title.trim(),
        values,
      };

      let res: Response;
      if (editingId) {
        res = await fetch(`/api/admin/comparison-features?id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/comparison-features', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, order: features.length }),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Save failed');

      setSuccess(editingId ? 'Feature updated successfully.' : 'Feature created successfully.');
      const refetched = await fetch('/api/admin/comparison-features').then((r) => r.json());
      if (refetched.success) {
        setFeatures(refetched.data);
      }
      setIsFormOpen(false);
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save feature.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature from the ledger?')) return;
    try {
      const res = await fetch(`/api/admin/comparison-features?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setFeatures((prev) => prev.filter((f) => f.id !== id));
      setSuccess('Feature deleted.');
    } catch (err: any) {
      setError(err.message || 'Delete failed.');
    }
  };

  const moveOrder = (id: string, dir: 'up' | 'down') => {
    setFeatures((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((f) => f.id === id);
      if (idx < 0) return prev;
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sorted.length) return prev;

      const a = sorted[idx];
      const b = sorted[targetIdx];
      const aOrder = a.order;
      const bOrder = b.order === aOrder ? (dir === 'up' ? aOrder - 1 : aOrder + 1) : b.order;

      return prev.map((f) => {
        if (f.id === a.id) return { ...f, order: bOrder };
        if (f.id === b.id) return { ...f, order: aOrder };
        return f;
      });
    });
  };

  const handleSaveOrder = async () => {
    setReordering(true);
    try {
      const sorted = [...features].sort((a, b) => a.order - b.order);
      const payload = sorted.map((f, i) => ({ id: f.id, order: i }));
      const res = await fetch('/api/admin/comparison-features/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: payload }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Reorder failed');
      setSuccess('Feature order saved.');
      setFeatures(sorted.map((f, i) => ({ ...f, order: i })));
    } catch (err: any) {
      setError(err.message || 'Failed to save order.');
    } finally {
      setReordering(false);
    }
  };

  const sortedFeatures = [...features].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#2b1611]">
            Feature Ledger Management
          </h1>
          <p className="text-sm text-[#564240] mt-1">
            Configure the public pricing comparison matrix features and plan values.
          </p>
        </div>
        <Link
          href="/admin/pricing"
          className="px-4 py-2 text-xs font-semibold bg-[#fff0ed] text-[#5b060c] border border-[#ddc0bd] rounded-full hover:bg-[#ffe2db] transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>View Pricing Plans</span>
          <span>→</span>
        </Link>
      </div>

      {/* Conditional Form Modal / Editor */}
      {isFormOpen && (
        <div className="bg-white border-2 border-[#5b060c]/20 rounded-2xl p-6 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-5 border-b border-[#ddc0bd]/40 pb-3">
            <div>
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#2b1611]">
                {editingId ? 'Edit Comparison Feature' : 'Add New Feature to Ledger'}
              </h2>
              <p className="text-xs text-[#564240] mt-0.5">
                Set the feature title and values per plan tier.
              </p>
            </div>
            <button
              onClick={resetForm}
              className="px-3 py-1 text-xs font-semibold text-[#564240] hover:text-[#2b1611] rounded-full border border-[#ddc0bd] hover:bg-[#fff0ed] transition cursor-pointer"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={LABEL_CLS}>Feature Title</label>
              <input
                className={INPUT_CLS}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ATS Optimization, Vector PDF Export, AI Cover Letter..."
              />
            </div>

            <div className="pt-2">
              <label className={LABEL_CLS}>Plan Values (Matrix Cells)</label>
              <p className="text-xs text-[#564240] mb-3">
                Tip: Enter <strong>check</strong> to show a checkmark icon, or <strong>—</strong>{' '}
                for not included, or specific text like <strong>Basic</strong>,{' '}
                <strong>15/mo</strong>, <strong>Unlimited</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {plans.map((p) => (
                  <div
                    key={p.slug}
                    className="p-3 bg-[#fff8f6] border border-[#ddc0bd]/50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#5b060c] font-['Playfair_Display']">
                        {p.name} ({p.slug})
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setValues({ ...values, [p.slug]: 'check' })}
                          className="px-1.5 py-0.5 text-[10px] bg-white border border-[#ddc0bd] rounded hover:bg-[#ffe2db] text-[#5b060c]"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => setValues({ ...values, [p.slug]: '—' })}
                          className="px-1.5 py-0.5 text-[10px] bg-white border border-[#ddc0bd] rounded hover:bg-[#ffe2db] text-[#564240]"
                        >
                          —
                        </button>
                      </div>
                    </div>
                    <input
                      className={INPUT_CLS}
                      value={values[p.slug] ?? ''}
                      onChange={(e) => setValues({ ...values, [p.slug]: e.target.value })}
                      placeholder="e.g. check, —, Basic..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-4 text-sm text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200">
              {success}
            </p>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t border-[#ddc0bd]/40">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[#5b060c] text-white text-sm font-semibold rounded-full hover:bg-[#7a1f1f] disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              {saving ? 'Saving…' : editingId ? 'Update Feature' : 'Create Feature'}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2.5 border border-[#ddc0bd] text-sm font-semibold rounded-full hover:bg-[#fff0ed] transition cursor-pointer text-[#564240]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Features List */}
      <div className="bg-white border border-[#ddc0bd] rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ddc0bd]/50 bg-[#fffdfb]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-['Playfair_Display'] text-lg font-bold text-[#2b1611]">
                Configured Feature Rows ({features.length})
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#fff0ed] text-[#5b060c] font-semibold border border-[#ddc0bd]">
                {plans.length} plans active: {plans.map((p) => p.name).join(', ')}
              </span>
            </div>
            <p className="text-xs text-[#564240]">
              Use ↑ / ↓ to adjust vertical order in the public comparison table.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveOrder}
              disabled={reordering}
              className="px-4 py-2 text-xs font-semibold bg-[#fff0ed] text-[#5b060c] border border-[#ddc0bd] rounded-full hover:bg-[#ffe2db] disabled:opacity-50 transition shadow-xs cursor-pointer"
            >
              {reordering ? 'Saving Order…' : '💾 Save Order'}
            </button>
            {!isFormOpen && (
              <button
                onClick={startCreate}
                className="px-4 py-2 bg-[#5b060c] text-white text-xs font-semibold rounded-full hover:bg-[#7a1f1f] transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span className="text-sm font-bold">+</span> Add Feature
              </button>
            )}
          </div>
        </div>

        {sortedFeatures.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#564240]">
            No comparison features configured yet. Click <strong>+ Add Feature</strong> to add your
            first ledger row.
          </div>
        ) : (
          <ul className="divide-y divide-[#ddc0bd]/40">
            {sortedFeatures.map((feat, idx) => (
              <li key={feat.id} className="px-6 py-4 hover:bg-[#fffbf8] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#f4ebe1] text-[#5b060c] text-[11px] font-bold inline-flex items-center justify-center border border-[#ddc0bd]">
                        {idx + 1}
                      </span>
                      <h3 className="font-semibold text-[#2b1611] font-['Playfair_Display'] text-base">
                        {feat.title}
                      </h3>
                    </div>
                    {/* Plan values pills */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {plans.map((p) => {
                        const val = feat.values[p.slug] || '—';
                        return (
                          <span
                            key={p.slug}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-[#fff8f6] border border-[#ddc0bd]/50 text-[#564240]"
                          >
                            <strong className="text-[#5b060c] font-medium">{p.name}:</strong>
                            <span>{val === 'check' ? '✓ (Check)' : val}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => moveOrder(feat.id, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-[#ddc0bd] hover:bg-[#fff0ed] disabled:opacity-30 text-xs cursor-pointer"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveOrder(feat.id, 'down')}
                      disabled={idx === sortedFeatures.length - 1}
                      className="p-1.5 rounded-lg border border-[#ddc0bd] hover:bg-[#fff0ed] disabled:opacity-30 text-xs cursor-pointer"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => startEdit(feat)}
                      className="px-3 py-1.5 text-xs font-semibold border border-[#5b060c]/30 text-[#5b060c] rounded-lg hover:bg-[#fff0ed] transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(feat.id)}
                      className="px-3 py-1.5 text-xs font-semibold border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

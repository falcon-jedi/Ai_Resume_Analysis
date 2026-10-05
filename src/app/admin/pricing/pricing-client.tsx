'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Currency, TemplateAccess } from '@/app/api/model/enums/currency';

interface Feature {
  id: string;
  feature: string;
  available: boolean;
  highlight: boolean;
  order: number;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceInr: number;
  priceUsd: number;
  currency: Currency | string;
  templateAccess: TemplateAccess | string;
  durationDays: number | null;
  limitAtsAnalysis: number;
  limitAiSuggestion: number;
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
  buttonText: string;
  features: Feature[];
}

interface ComparisonFeatureSummary {
  id: string;
  title: string;
}

interface PricingAdminClientProps {
  initialPlans: Plan[];
  comparisonFeatures?: ComparisonFeatureSummary[];
}

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  buttonText: 'Select Plan',
  priceInr: 0,
  priceUsd: 0,
  templateAccess: TemplateAccess.FREE,
  durationDays: '' as string | number,
  limitAtsAnalysis: 1,
  limitAiSuggestion: 1,
  isPopular: false,
  displayOrder: 0,
  features: [] as Array<{
    id?: string;
    feature: string;
    available: boolean;
    highlight: boolean;
    order: number;
  }>,
};

type FormState = typeof EMPTY_FORM;

const INPUT_CLS =
  'w-full bg-[#fff8f6] border border-[#ddc0bd] rounded-lg px-3 py-2 text-sm text-[#2b1611] placeholder:text-[#cba89d] focus:outline-none focus:ring-2 focus:ring-[#5b060c]/30 transition';
const LABEL_CLS = 'block text-xs font-semibold text-[#564240] mb-1 uppercase tracking-wide';

export function PricingAdminClient({
  initialPlans,
  comparisonFeatures = [],
}: PricingAdminClientProps) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setNewFeatureText('');
    setEditingId(null);
    setIsFormOpen(true);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (plan: Plan) => {
    setForm({
      name: plan.name || '',
      slug: plan.slug || '',
      description: plan.description || '',
      buttonText: plan.buttonText || 'Select Plan',
      priceInr: plan.priceInr ?? 0,
      priceUsd: plan.priceUsd ?? 0,
      templateAccess: (plan.templateAccess as TemplateAccess) || TemplateAccess.FREE,
      durationDays: plan.durationDays ?? '',
      limitAtsAnalysis: plan.limitAtsAnalysis ?? 1,
      limitAiSuggestion: plan.limitAiSuggestion ?? 1,
      isPopular: plan.isPopular ?? false,
      displayOrder: plan.displayOrder ?? 0,
      features: (plan.features || []).map((f, i) => ({
        id: f.id,
        feature: f.feature,
        available: f.available ?? true,
        highlight: f.highlight ?? false,
        order: f.order ?? i,
      })),
    });
    setNewFeatureText('');
    setEditingId(plan.id);
    setIsFormOpen(true);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setNewFeatureText('');
    setEditingId(null);
    setIsFormOpen(false);
    setError('');
    setSuccess('');
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setForm((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        {
          feature: newFeatureText.trim(),
          available: true,
          highlight: false,
          order: prev.features.length,
        },
      ],
    }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleToggleFeatureAvailable = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? { ...f, available: !f.available } : f)),
    }));
  };

  const handleToggleFeatureHighlight = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? { ...f, highlight: !f.highlight } : f)),
    }));
  };

  const NUM_FIELDS: [string, keyof FormState][] = [
    ['Price INR (₹)', 'priceInr'],
    ['Price USD ($)', 'priceUsd'],
    ['ATS Analysis Limit', 'limitAtsAnalysis'],
    ['AI Suggestion Limit', 'limitAiSuggestion'],
    ['Display Order', 'displayOrder'],
  ];

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      setError('Name and slug are required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const body = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        buttonText: form.buttonText,
        templateAccess: form.templateAccess,
        durationDays: form.durationDays === '' ? null : Number(form.durationDays),
        priceInr: Number(form.priceInr),
        priceUsd: Number(form.priceUsd),
        limitAtsAnalysis: Number(form.limitAtsAnalysis),
        limitAiSuggestion: Number(form.limitAiSuggestion),
        displayOrder: Number(form.displayOrder),
        isPopular: form.isPopular,
        features: form.features.map((f, i) => ({
          feature: f.feature,
          available: f.available,
          highlight: f.highlight,
          order: i,
        })),
        ...(editingId ? { id: editingId } : {}),
      };
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/pricing', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      setSuccess(editingId ? 'Plan updated successfully.' : 'Plan created successfully.');
      const updated = await fetch('/api/admin/pricing').then((r) => r.json());
      if (updated.success) setPlans(updated.data);
      setIsFormOpen(false);
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Error saving plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    setSaving(true);
    try {
      await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: plan.id, isActive: !plan.isActive }),
      });
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p)));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    await fetch(`/api/admin/pricing?id=${id}`, { method: 'DELETE' });
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const moveOrder = (id: string, dir: 'up' | 'down') => {
    setPlans((prev) => {
      const sorted = [...prev].sort((a, b) => a.displayOrder - b.displayOrder);
      const idx = sorted.findIndex((p) => p.id === id);
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const a = sorted[idx];
      const b = sorted[swapIdx];
      const aOrder = a.displayOrder;
      const bOrder = b.displayOrder;
      return prev.map((p) => {
        if (p.id === a.id) return { ...p, displayOrder: bOrder };
        if (p.id === b.id) return { ...p, displayOrder: aOrder };
        return p;
      });
    });
  };

  const handleSaveOrder = async () => {
    setReordering(true);
    try {
      await fetch('/api/admin/pricing/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orders: plans.map((p) => ({ id: p.id, displayOrder: p.displayOrder })),
        }),
      });
      setSuccess('Display order saved successfully.');
    } finally {
      setReordering(false);
    }
  };

  const sortedPlans = [...plans].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-8">
      {/* Top Banner / Feature Ledger Quick Link & Preview */}
      <div className="bg-[#FFF8EE] border border-[#E5D9C8] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5b060c] font-['Hanken_Grotesk']">
              Feature Ledger
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#fff0ed] text-[#5b060c] font-bold border border-[#ddc0bd]">
              {comparisonFeatures.length} configured
            </span>
          </div>
          <p className="text-xs text-[#564240] mt-1 font-['Hanken_Grotesk']">
            {comparisonFeatures.length > 0 ? (
              <>
                {comparisonFeatures.length} features configured:{' '}
                <strong>
                  {comparisonFeatures
                    .slice(0, 3)
                    .map((f) => f.title)
                    .join(', ')}
                </strong>
                {comparisonFeatures.length > 3 ? ` (+${comparisonFeatures.length - 3} more)` : ''}
              </>
            ) : (
              'Configure feature comparison rows for all plans on the public pricing page.'
            )}
          </p>
        </div>
        <Link
          href="/admin/features"
          className="px-4 py-2 text-xs font-semibold bg-white text-[#5b060c] border border-[#ddc0bd] rounded-full hover:bg-[#fff0ed] hover:border-[#5b060c]/40 transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>View Feature Ledger</span>
          <span>→</span>
        </Link>
      </div>

      {/* Conditional Form Modal / Collapsible Section */}
      {isFormOpen && (
        <div className="bg-white border-2 border-[#5b060c]/20 rounded-2xl p-6 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-5 border-b border-[#ddc0bd]/40 pb-3">
            <div>
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#2b1611]">
                {editingId ? 'Edit Plan' : 'Create New Plan'}
              </h2>
              <p className="text-xs text-[#564240] mt-0.5">
                {editingId
                  ? 'Modify existing subscription tier settings'
                  : 'Add a new pricing tier to the catalogue'}
              </p>
            </div>
            <button
              onClick={resetForm}
              className="px-3 py-1 text-xs font-semibold text-[#564240] hover:text-[#2b1611] rounded-full border border-[#ddc0bd] hover:bg-[#fff0ed] transition cursor-pointer"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Plan Name</label>
              <input
                className={INPUT_CLS}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Plus, Pro, Enterprise"
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Slug</label>
              <input
                className={INPUT_CLS}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                placeholder="e.g. plus, pro, enterprise"
              />
            </div>
            <div className="md:col-span-2">
              <label className={LABEL_CLS}>Description</label>
              <textarea
                className={INPUT_CLS}
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short benefit description shown on the pricing card..."
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Button Text</label>
              <input
                className={INPUT_CLS}
                value={form.buttonText}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Template Access Tier</label>
              <select
                className={INPUT_CLS}
                value={form.templateAccess}
                onChange={(e) =>
                  setForm({ ...form, templateAccess: e.target.value as TemplateAccess })
                }
              >
                <option value={TemplateAccess.FREE}>FREE — Free templates only (Restricted)</option>
                <option value={TemplateAccess.ALL}>
                  ALL — All templates unlocked (Full catalog)
                </option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Duration Days (blank = 30-day monthly)</label>
              <input
                className={INPUT_CLS}
                type="number"
                min="1"
                placeholder="e.g. 7 for 7-day pass, or leave empty"
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
              />
            </div>
            {NUM_FIELDS.map(([label, key]) => (
              <div key={key}>
                <label className={LABEL_CLS}>{label}</label>
                <input
                  className={INPUT_CLS}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form[key] as number}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isPopular"
                checked={form.isPopular}
                onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                className="accent-[#5b060c] w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor="isPopular"
                className="text-sm font-medium text-[#2b1611] cursor-pointer"
              >
                Mark as Most Popular (Highlighted Card)
              </label>
            </div>
          </div>

          {/* Custom Plan Features Section */}
          <div className="mt-6 pt-5 border-t border-[#ddc0bd]/40">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-['Playfair_Display'] text-base font-bold text-[#2b1611]">
                  Custom Plan Features ({form.features.length})
                </h3>
                <p className="text-xs text-[#564240]">
                  Additional bullet points displayed on the pricing card.
                </p>
              </div>
            </div>

            {/* Add feature input */}
            <div className="flex gap-2 mb-4">
              <input
                className={INPUT_CLS}
                placeholder="e.g. Priority 24/7 Support, Cover Letter Builder..."
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-[#5b060c] text-white text-xs font-semibold rounded-lg hover:bg-[#7a1f1f] transition shrink-0 cursor-pointer"
              >
                + Add Feature
              </button>
            </div>

            {/* Features List */}
            {form.features.length === 0 ? (
              <p className="text-xs text-[#564240] italic bg-[#fff8f6] p-3 rounded-lg border border-[#ddc0bd]/40">
                No custom features added yet. (Template access and quota limits are automatically
                calculated and displayed).
              </p>
            ) : (
              <ul className="space-y-2">
                {form.features.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between gap-3 p-2.5 bg-[#fff8f6] border border-[#ddc0bd]/50 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#7a1f1f] w-5">#{idx + 1}</span>
                      <span
                        className={`text-xs text-[#2b1611] truncate ${feat.highlight ? 'font-bold' : ''}`}
                      >
                        {feat.feature}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <label className="flex items-center gap-1.5 text-xs text-[#564240] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={feat.available}
                          onChange={() => handleToggleFeatureAvailable(idx)}
                          className="accent-[#5b060c] w-3.5 h-3.5"
                        />
                        Available
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-[#564240] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={feat.highlight}
                          onChange={() => handleToggleFeatureHighlight(idx)}
                          className="accent-[#5b060c] w-3.5 h-3.5"
                        />
                        Highlight
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1 text-red-600 hover:text-red-800 text-xs font-bold transition cursor-pointer"
                        title="Remove feature"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
              {saving ? 'Saving…' : editingId ? 'Update Plan' : 'Create Plan'}
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

      {/* Plans List */}
      <div className="bg-white border border-[#ddc0bd] rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ddc0bd]/50 bg-[#fffdfb]">
          <div>
            <h2 className="font-['Playfair_Display'] text-lg font-bold text-[#2b1611]">
              Active & Configured Plans ({plans.length})
            </h2>
            <p className="text-xs text-[#564240]">
              Use ↑ / ↓ to adjust display order on the public pricing page.
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
                <span className="text-sm font-bold">+</span> Add Plan
              </button>
            )}
          </div>
        </div>
        <ul className="divide-y divide-[#ddc0bd]/40">
          {sortedPlans.map((plan, idx) => (
            <li key={plan.id} className="px-6 py-4 hover:bg-[#fffbf8] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-5 h-5 rounded-full bg-[#f4ebe1] text-[#5b060c] text-[11px] font-bold inline-flex items-center justify-center border border-[#ddc0bd]">
                      {idx + 1}
                    </span>
                    <h3 className="font-semibold text-[#2b1611] font-['Playfair_Display'] text-base">
                      {plan.name}
                    </h3>
                    {plan.isPopular && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#fde68a] text-[#713f12] border border-[#fbbf24] font-bold uppercase tracking-wide">
                        Popular
                      </span>
                    )}
                    {!plan.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#f3f4f6] text-[#4b5563] border border-[#d1d5db] font-bold uppercase tracking-wide">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#564240] font-medium mt-1">
                    Slug: <span className="font-mono text-[#7a1f1f]">{plan.slug}</span>
                    {' · '}₹<strong>{plan.priceInr}</strong> INR
                    {' · '}$<strong>{plan.priceUsd}</strong> USD
                    {plan.durationDays ? ` · ${plan.durationDays} days pass` : ' · 30-day monthly'}
                    {' · '}Templates: <strong>{plan.templateAccess}</strong>
                  </p>
                  <p className="text-xs text-[#564240] mt-0.5">
                    ATS Quota: <strong>{plan.limitAtsAnalysis}</strong> · AI Quota:{' '}
                    <strong>{plan.limitAiSuggestion}</strong> · Order:{' '}
                    <strong>{plan.displayOrder}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => moveOrder(plan.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-[#ddc0bd] hover:bg-[#fff0ed] disabled:opacity-30 text-xs cursor-pointer"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveOrder(plan.id, 'down')}
                    disabled={idx === sortedPlans.length - 1}
                    className="p-1.5 rounded-lg border border-[#ddc0bd] hover:bg-[#fff0ed] disabled:opacity-30 text-xs cursor-pointer"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                    className="px-3 py-1.5 text-xs font-semibold border border-[#ddc0bd] rounded-lg hover:bg-[#fff0ed] transition cursor-pointer"
                  >
                    {expandedPlanId === plan.id ? 'Hide' : 'Features'}
                  </button>
                  <button
                    onClick={() => startEdit(plan)}
                    className="px-3 py-1.5 text-xs font-semibold border border-[#5b060c]/30 text-[#5b060c] rounded-lg hover:bg-[#fff0ed] transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className="px-3 py-1.5 text-xs font-semibold border border-[#ddc0bd] rounded-lg hover:bg-[#fff0ed] transition cursor-pointer"
                  >
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="px-3 py-1.5 text-xs font-semibold border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {expandedPlanId === plan.id && (
                <div className="mt-3 bg-[#fff8f6] rounded-xl p-4 border border-[#ddc0bd]/40 animate-in fade-in duration-150">
                  <p className="text-xs text-[#564240] leading-relaxed">{plan.description}</p>
                  <div className="mt-2.5">
                    <p className="text-[11px] font-bold text-[#5b060c] uppercase tracking-wider mb-1">
                      Included Features:
                    </p>
                    <ul className="space-y-1">
                      {plan.features.map((f) => (
                        <li key={f.id} className="flex items-center gap-2 text-xs text-[#2b1611]">
                          <span
                            className={
                              f.available ? 'text-green-600 font-bold' : 'text-red-400 font-bold'
                            }
                          >
                            {f.available ? '✓' : '✗'}
                          </span>
                          <span>{f.feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

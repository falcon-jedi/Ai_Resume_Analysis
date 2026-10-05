'use client';

import { SheetCard, SectionHeading, PrimaryBtn } from './settings-primitives';
import { cn } from '@/app/app/_util/cn';

const FONT_OPTIONS = ['Playfair Display', 'Hanken Grotesk', 'Inter', 'Georgia', 'Times New Roman'];
const PAGE_SIZE_OPTIONS = ['A4 (210×297mm)', 'Letter (8.5×11in)', 'Legal (8.5×14in)'];

export function ResumePrefsSection() {
  return (
    <SheetCard id="resume-prefs">
      <SectionHeading icon="article">Resume Preferences</SectionHeading>

      <div className="grid grid-cols-2 gap-8">
        {/* Default Font */}
        <div className="space-y-3">
          <label
            className="text-[12px] font-semibold text-[#564240] uppercase tracking-[0.05em]"
            style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
          >
            Default Body Font
          </label>
          <select
            className="w-full border border-[#ddc0bd] rounded-lg px-4 py-3 text-[#2b1611] focus:border-[#5b060c] focus:outline-none appearance-none"
            style={{ fontFamily: 'Hanken Grotesk, sans-serif', background: '#fff0ed' }}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Page Size */}
        <div className="space-y-3">
          <label
            className="text-[12px] font-semibold text-[#564240] uppercase tracking-[0.05em]"
            style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
          >
            Default Page Size
          </label>
          <select
            className="w-full border border-[#ddc0bd] rounded-lg px-4 py-3 text-[#2b1611] focus:border-[#5b060c] focus:outline-none appearance-none"
            style={{ fontFamily: 'Hanken Grotesk, sans-serif', background: '#fff0ed' }}
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Margin density */}
        <div className="space-y-3 col-span-2">
          <label
            className="text-[12px] font-semibold text-[#564240] uppercase tracking-[0.05em]"
            style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
          >
            Content Density
          </label>
          <div className="flex gap-3">
            {['Compact', 'Balanced', 'Spacious'].map((opt) => (
              <button
                key={opt}
                className={cn(
                  'flex-1 py-3 rounded-lg text-[14px] font-semibold border transition-all',
                  opt === 'Balanced'
                    ? 'border-[#5b060c] bg-[#5b060c]/5 text-[#5b060c]'
                    : 'border-[#ddc0bd] text-[#564240] hover:border-[#5b060c]',
                )}
                style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <PrimaryBtn onClick={() => alert('Preferences saved (placeholder)')}>
          Save Preferences
        </PrimaryBtn>
      </div>
    </SheetCard>
  );
}

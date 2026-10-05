'use client';

import { SheetCard, SectionHeading, Toggle, PrimaryBtn } from './settings-primitives';
import { cn } from '@/app/app/_util/cn';

export function ExportDefaultsSection() {
  return (
    <SheetCard id="export">
      <SectionHeading icon="file_download">Export Configuration</SectionHeading>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-3">
            <label
              className="text-[14px] font-semibold text-[#2b1611]"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              Default File Format
            </label>
            <div className="flex gap-2">
              {['PDF', 'DOCX'].map((fmt) => (
                <button
                  key={fmt}
                  className={cn(
                    'flex-1 py-3 rounded-lg text-[14px] font-bold border transition-all',
                    fmt === 'PDF'
                      ? 'border-[#5b060c] bg-[#5b060c]/5 text-[#5b060c]'
                      : 'border-[#ddc0bd] text-[#564240]',
                  )}
                  style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label
              className="text-[14px] font-semibold text-[#2b1611]"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              Filename Pattern
            </label>
            <input
              type="text"
              defaultValue="{Name}_{Role}_Resume_2024"
              className="w-full border border-[#ddc0bd] rounded-lg px-4 py-3 font-mono text-sm focus:border-[#5b060c] focus:outline-none"
              style={{ background: '#fff0ed' }}
            />
          </div>
        </div>
        <div className="pt-6 border-t border-[#E5D9C8] space-y-5">
          {[
            {
              label: 'Include Contact QR Code',
              desc: 'Embed a digital business card in your header',
              on: true,
            },
            {
              label: 'High-DPI Font Rendering',
              desc: 'Optimize typography for digital viewing',
              on: true,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p
                  className="text-[14px] font-semibold text-[#2b1611]"
                  style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                >
                  {item.label}
                </p>
                <p
                  className="text-[12px] text-[#564240]"
                  style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                >
                  {item.desc}
                </p>
              </div>
              <Toggle on={item.on} />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <PrimaryBtn onClick={() => alert('Export defaults saved (placeholder)')}>
            Save Defaults
          </PrimaryBtn>
        </div>
      </div>
    </SheetCard>
  );
}

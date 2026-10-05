'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { SheetCard, SectionHeading, Toggle } from './settings-primitives';
import { cn } from '@/app/app/_util/cn';

const TONE_OPTIONS = ['Executive', 'Professional', 'Creative', 'Concise'];

export function AIPreferencesSection() {
  const toggles = [
    { icon: 'bolt', label: 'Real-time ATS Scoring', on: true },
    { icon: 'spellcheck', label: 'Auto-Optimization', on: true },
    { icon: 'link', label: 'Contextual Linking', on: false },
  ];

  return (
    <SheetCard id="ai-prefs">
      <SectionHeading icon="history_edu">AI Workshop Preferences</SectionHeading>

      <div className="grid grid-cols-2 gap-8">
        {/* Left: tone + intensity */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label
              className="text-[14px] font-semibold text-[#2b1611]"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              Preferred Writing Tone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone}
                  className={cn(
                    'px-4 py-2 text-[13px] rounded-lg font-semibold border transition-all',
                    tone === 'Executive'
                      ? 'border-[#5b060c] bg-[#5b060c]/5 text-[#5b060c]'
                      : 'border-[#ddc0bd] text-[#564240] hover:border-[#5b060c]',
                  )}
                  style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-[14px] font-semibold text-[#2b1611]"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              Suggestion Intensity
            </label>
            <input
              type="range"
              className="w-full"
              style={{ accentColor: '#5b060c' }}
              defaultValue={60}
            />
            <div className="flex justify-between">
              <span
                className="text-[10px] uppercase font-bold text-[#8a716f]"
                style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
              >
                Light Touch
              </span>
              <span
                className="text-[10px] uppercase font-bold text-[#8a716f]"
                style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
              >
                Full Rewrite
              </span>
            </div>
          </div>
        </div>

        {/* Right: feature toggles */}
        <div className="rounded-xl p-6 space-y-6" style={{ background: '#ffe9e4' }}>
          {toggles.map((t) => (
            <div key={t.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconMapper name={t.icon} className="text-[#5b060c] text-[18px]" />
                <span
                  className="text-[14px] font-semibold text-[#2b1611]"
                  style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                >
                  {t.label}
                </span>
              </div>
              <Toggle on={t.on} />
            </div>
          ))}
        </div>
      </div>
    </SheetCard>
  );
}

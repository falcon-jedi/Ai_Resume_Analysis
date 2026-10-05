'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { SheetCard, SectionHeading, SettingsRow } from './settings-primitives';

export function AccountSection() {
  return (
    <SheetCard id="account">
      <SectionHeading icon="account_circle">Account &amp; Security</SectionHeading>

      <div className="space-y-0">
        {/* <SettingsRow label="Password Management" description="Last changed 3 months ago">
          <button
            className="text-[#5b060c] text-[14px] font-semibold border border-[#5b060c] px-4 py-2 rounded-lg hover:bg-[#5b060c]/5 transition-colors"
            style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            onClick={() => alert('Change password (placeholder)')}
          >
            Update Password
          </button>
        </SettingsRow> */}
        <SettingsRow
          label="Verified Email Identity"
          description="Your primary email has been formally verified"
          bordered={false}
        >
          <div className="flex items-center gap-2">
            <IconMapper
              name="verified"
              className="text-green-600"
              style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
            />
            <span
              className="text-[13px] text-[#564240]"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              active
            </span>
          </div>
        </SettingsRow>
      </div>
    </SheetCard>
  );
}

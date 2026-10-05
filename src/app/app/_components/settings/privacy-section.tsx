'use client';

import { SheetCard, SectionHeading, SettingsRow, Toggle } from './settings-primitives';

export function PrivacySection() {
  const items = [
    { label: 'Public Profile', desc: 'Allow others to find your profile via search', on: false },
    {
      label: 'Analytics & Tracking',
      desc: 'Help us improve with anonymous usage data',
      on: true,
    },
    {
      label: 'Resume Download Tracking',
      desc: 'Track who downloads your shared resume links',
      on: true,
    },
    {
      label: 'AI Training Consent',
      desc: 'Allow anonymized resume data to improve AI models',
      on: false,
    },
  ];

  return (
    <SheetCard id="privacy">
      <SectionHeading icon="security">Privacy &amp; Security</SectionHeading>
      <div className="space-y-0">
        {items.map((item, i) => (
          <SettingsRow
            key={item.label}
            label={item.label}
            description={item.desc}
            bordered={i < items.length - 1}
          >
            <Toggle on={item.on} />
          </SettingsRow>
        ))}
      </div>
    </SheetCard>
  );
}

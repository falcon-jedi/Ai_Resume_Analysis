'use client';

import { SheetCard, SectionHeading, SettingsRow, Toggle } from './settings-primitives';

export function NotificationsSection() {
  const items = [
    {
      label: 'Resume Viewed Alerts',
      desc: 'Get notified when a recruiter views your resume',
      on: true,
    },
    {
      label: 'ATS Score Updates',
      desc: 'Alerts when your ATS score changes significantly',
      on: true,
    },
    {
      label: 'Template Announcements',
      desc: 'New template releases and design updates',
      on: false,
    },
    {
      label: 'AI Optimization Tips',
      desc: 'Weekly AI suggestions to improve your resume',
      on: true,
    },
    { label: 'Marketing Emails', desc: 'Product updates, tips, and special offers', on: false },
  ];

  return (
    <SheetCard id="notifications">
      <SectionHeading icon="notifications">Notifications</SectionHeading>
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

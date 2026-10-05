'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconMapper } from '@/app/_components/icons/IconMapper';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'system' | 'ats' | 'account';
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Welcome to JobPatra Career Workshop',
    description:
      'Your workspace is ready! Build your first resume or run an ATS keyword scan to optimize your chances of landing interviews.',
    timestamp: 'Just now',
    read: false,
    type: 'system',
    link: '/app/resume/new',
  },
  {
    id: '2',
    title: 'ATS Analyzer Engine Ready',
    description:
      'Match your resume against any job description to discover missing competencies and maximize your keyword match score.',
    timestamp: '1 day ago',
    read: false,
    type: 'ats',
    link: '/app/ats-workspace',
  },
  {
    id: '3',
    title: 'Account Security Verified',
    description:
      'Your credentials and profile are active. You can manage your preferences anytime in Settings.',
    timestamp: '3 days ago',
    read: true,
    type: 'account',
    link: '/app/settings',
  },
];

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-full space-y-8 font-['Hanken_Grotesk'] text-[#2b1611]">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff0ee] text-[#370003] border border-[#E5D9C8] shadow-xs">
            <IconMapper name="notifications" className="text-sm text-[#370003]" /> Notification
            Center
          </div>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#370003] leading-tight">
            Notifications
          </h1>
          <p className="text-[#564240] text-sm">
            Stay updated with system announcements, ATS reports, and account updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs font-semibold text-[#7a1f1f] hover:underline bg-white border border-[#E5D9C8] px-4 py-2 rounded-full cursor-pointer shadow-xs"
            >
              Mark all as read
            </button>
          )}
          <Link
            href="/app/settings"
            className="text-xs font-semibold text-[#564240] hover:text-[#370003] bg-white border border-[#E5D9C8] px-4 py-2 rounded-full shadow-xs flex items-center gap-1.5"
          >
            <IconMapper name="settings" className="text-xs" />
            <span>Preferences</span>
          </Link>
        </div>
      </header>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white border border-[#E5D9C8] rounded-2xl p-12 text-center space-y-3">
            <IconMapper name="notifications_off" className="text-4xl text-[#8a716f] mx-auto" />
            <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#370003]">
              No notifications right now
            </h3>
            <p className="text-sm text-[#564240]">
              When there are updates about your resumes or ATS scans, they&apos;ll show up here.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
            const iconName =
              item.type === 'ats' ? 'analytics' : item.type === 'system' ? 'sparkles' : 'settings';

            return (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex items-start gap-4 ${
                  !item.read ? 'border-[#7a1f1f]/40 bg-[#FFF8F6]' : 'border-[#E5D9C8]'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#fff0ed] border border-[#ddc0bd] flex items-center justify-center text-[#7a1f1f] shrink-0 mt-0.5">
                  <IconMapper name={iconName} className="text-xl" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-['Playfair_Display'] font-bold text-base text-[#370003] flex items-center gap-2">
                      <span>{item.title}</span>
                      {!item.read && <span className="w-2 h-2 rounded-full bg-[#7a1f1f]" />}
                    </h3>
                    <span className="text-xs text-[#8a716f] whitespace-nowrap">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-[#564240] leading-relaxed">{item.description}</p>
                  {item.link && (
                    <div className="pt-2">
                      <Link
                        href={item.link}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#7a1f1f] hover:underline"
                      >
                        <span>View Details</span>
                        <IconMapper name="arrow_forward" className="text-xs" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import { cn } from '@/app/app/_util/cn';

import { ProfileSection } from '@/app/app/_components/settings/profile-section';
import { AccountSection } from '@/app/app/_components/settings/account-section';
import { SubscriptionSection } from '@/app/app/_components/settings/subscription-section';

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'account', label: 'Account', icon: 'account_circle' },
  { id: 'subscription', label: 'Subscription', icon: 'workspace_premium' },
];

export default function SettingsClient({ session }: { session: Session }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sectionFromUrl = searchParams.get('section');
  const initialSection = NAV_ITEMS.some((i) => i.id === sectionFromUrl)
    ? (sectionFromUrl as string)
    : 'profile';

  const [activeId, setActiveId] = useState(initialSection);

  useEffect(() => {
    if (sectionFromUrl && NAV_ITEMS.some((i) => i.id === sectionFromUrl)) {
      setActiveId(sectionFromUrl);
    }
  }, [sectionFromUrl]);

  const handleSelectSection = (id: string) => {
    setActiveId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const renderSectionContent = () => {
    switch (activeId) {
      case 'profile':
        return <ProfileSection />;
      case 'account':
        return <AccountSection />;
      case 'subscription':
        return <SubscriptionSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden no-scrollbar"
      style={{ background: '#F8F2E8', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Paper texture */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')",
          opacity: 0.03,
        }}
      />

      <div className="relative z-[2] max-w-6xl w-full mx-auto px-6 lg:px-10 py-6 lg:py-8 flex flex-col h-full overflow-hidden">
        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <header className="mb-6 flex items-end justify-between border-b border-[#ddc0bd] pb-5 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1
                className="text-[28px] lg:text-[32px] leading-[36px] lg:leading-[40px] font-semibold text-[#5b060c]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Settings
              </h1>
              <IconMapper name="attach_file" className="text-[#8a716f] rotate-45 text-xl" />
            </div>
            <p
              className="text-[14px] lg:text-[16px] text-[#564240]"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              Manage your account, preferences and subscription.
            </p>
          </div>
          {/* User chip */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#fff0ed] border border-[#ddc0bd] flex items-center justify-center">
              <span
                className="text-[14px] font-bold text-[#5b060c]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <p
              className="text-[13px] font-semibold text-[#2b1611]"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              {session.user?.name ?? session.user?.email}
            </p>
          </div>
        </header>

        {/* Mobile Navigation (Dropdown & Horizontal Scroll) */}
        <div className="md:hidden mb-4 shrink-0 flex flex-col gap-2">
          <label className="text-[11px] font-bold text-[#564240] uppercase tracking-wider font-['Hanken_Grotesk']">
            Select Section
          </label>
          <div className="relative">
            <select
              value={activeId}
              onChange={(e) => handleSelectSection(e.target.value)}
              className="w-full bg-white border border-[#ddc0bd] rounded-lg px-4 py-2.5 text-[#2b1611] text-[15px] font-semibold focus:outline-none focus:border-[#5b060c] font-['Hanken_Grotesk'] cursor-pointer appearance-none pr-10 shadow-sm"
            >
              {NAV_ITEMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <IconMapper
              name="expand_more"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#564240] pointer-events-none"
            />
          </div>

          {/* Horizontal scroll pill tabs for quick touch access on mobile */}
          <div
            className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectSection(item.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0',
                    isActive
                      ? 'bg-[#5b060c] text-white'
                      : 'bg-white text-[#564240] border border-[#ddc0bd]',
                  )}
                  style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                >
                  <IconMapper name={item.icon} className="text-[16px]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Desktop & Mobile Body grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-6 items-start flex-1 min-h-0 overflow-hidden">
          {/* Desktop side nav */}
          <nav
            className="hidden md:block col-span-4 lg:col-span-3 space-y-1 overflow-y-auto max-h-full pr-1 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectSection(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-semibold transition-all text-left cursor-pointer',
                    isActive
                      ? 'bg-[#5b060c] text-white shadow-sm'
                      : 'text-[#564240] hover:bg-[#ffe9e4]',
                  )}
                  style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                >
                  <IconMapper name={item.icon} className="text-[20px]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Content panel displaying ONLY active section */}
          <div
            className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col h-full overflow-y-auto pr-2 pb-6 space-y-8 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex-1">{renderSectionContent()}</div>

            {/* Footer */}
            <footer className="py-6 border-t border-[#ddc0bd]/40 flex flex-col sm:flex-row gap-4 justify-between items-center opacity-70 shrink-0">
              <p
                className="text-[12px] text-[#564240]"
                style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
              >
                © {new Date().getFullYear()} JobPatra. Crafted with professional precision.
              </p>
              <div className="flex gap-6">
                {['Terms', 'Privacy', 'Support'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-[12px] text-[#564240] hover:text-[#5b060c] transition-colors"
                    style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

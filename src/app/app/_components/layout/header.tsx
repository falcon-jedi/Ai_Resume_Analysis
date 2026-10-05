'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconMapper } from '@/app/_components/icons/IconMapper';
import { useUserProfile } from '@/app/app/_hooks/use-user-profile';
import { logoutClient } from '@/app/api/client/auth/auth-client';

const ROUTE_TITLES: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/resume/new': 'Build Resume',
  '/app/ats-workspace': 'ATS Analyzer',
  '/app/ats-workspace/processing': 'ATS Processing',
  '/app/settings': 'Settings',
  '/app/feedback': 'Feedback',
  '/app/faq': 'FAQ & Help',
  '/app/notifications': 'Notifications',
  '/app/subscription': 'Subscription & Plans',
  '/app/billing': 'Billing History',
};

function getPageTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname];
  }
  if (pathname.startsWith('/app/resume/')) {
    return 'Build Resume';
  }
  if (pathname.startsWith('/app/ats-workspace/result/')) {
    return 'ATS Analysis Results';
  }
  if (pathname.startsWith('/app/ats-workspace')) {
    return 'ATS Analyzer';
  }
  if (pathname.startsWith('/app/settings')) {
    return 'Settings';
  }
  return 'Dashboard';
}

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ onToggleSidebar }: HeaderProps = {}) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: userProfile } = useUserProfile();

  const title = getPageTitle(pathname);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  const userName = userProfile?.name || 'User';
  const userEmail = userProfile?.email || '';

  // Get initials for fallback avatar (e.g. "AS" for "Abhit Sahu")
  const initials =
    userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';

  const handleLogout = async () => {
    await logoutClient('/');
  };

  return (
    <header className="h-16 border-b border-[#ddc0bd] bg-[#FFF8EE]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left side: Hamburger button (mobile only) + Dynamic Page Title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 -ml-1 rounded-lg text-[#564240] hover:text-[#370003] hover:bg-white/80 transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <IconMapper name="menu" className="text-[22px]" />
          </button>
        )}
        <h1 className="font-['Playfair_Display'] text-[18px] sm:text-[20px] lg:text-[22px] font-bold text-[#370003] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right Actions: User Avatar Dropdown */}
      <div className="flex items-center gap-3">
        {/* User Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-white/60 border border-transparent hover:border-[#ddc0bd] transition-all cursor-pointer focus:outline-none"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-9 h-9 rounded-full bg-[#370003] text-white flex items-center justify-center font-bold text-xs font-['Playfair_Display'] shadow-sm shrink-0 border border-white">
              {userProfile?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userProfile.image}
                  alt={userName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <IconMapper
              name="keyboard_arrow_down"
              className={`text-[#564240] text-[18px] transition-transform duration-200 hidden sm:block ${
                dropdownOpen ? 'rotate-180 text-[#370003]' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#ddc0bd] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-['Hanken_Grotesk']">
              {/* User Identity Header */}
              <div className="px-4 py-3 border-b border-[#ddc0bd]/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#370003] text-white flex items-center justify-center font-bold text-sm font-['Playfair_Display'] shrink-0 shadow-sm">
                  {userProfile?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={userProfile.image}
                      alt={userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-['Playfair_Display'] text-sm font-bold text-[#2b1611] truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-[#564240]/80 truncate">{userEmail}</p>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="py-1">
                <Link
                  href="/app/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#564240] hover:text-[#370003] hover:bg-[#fff0ed] transition-colors"
                >
                  <IconMapper name="settings" className="text-[18px] text-[#7a1f1f]" />
                  <span className="font-medium">Profile &amp; Settings</span>
                </Link>

                <Link
                  href="/app/faq"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#564240] hover:text-[#370003] hover:bg-[#fff0ed] transition-colors"
                >
                  <IconMapper name="help_outline" className="text-[18px] text-[#7a1f1f]" />
                  <span className="font-medium">FAQ &amp; Help</span>
                </Link>

                <Link
                  href="/app/feedback"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#564240] hover:text-[#370003] hover:bg-[#fff0ed] transition-colors"
                >
                  <IconMapper name="feedback" className="text-[18px] text-[#7a1f1f]" />
                  <span className="font-medium">Feedback</span>
                </Link>
              </div>

              {/* Logout Separator & Action */}
              <div className="border-t border-[#ddc0bd]/40 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#ba1a1a] hover:bg-[#ba1a1a]/5 font-semibold transition-colors cursor-pointer text-left"
                >
                  <IconMapper name="logout" className="text-[18px]" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

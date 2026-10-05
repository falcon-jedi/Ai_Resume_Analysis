'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconMapper } from '@/app/_components/icons/IconMapper';
import { Logo } from '@/app/app/_components/common/logo';
import { getSessionClient } from '@/app/api/client/auth/auth-client';
import type { Session } from 'next-auth';

const navLinks = [
  { label: 'Templates', href: '/app/templates' },
  { label: 'ATS Checker', href: '/app/ats-checker' },
  { label: 'Pricing', href: '/app/pricing' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check auth state on mount and route change
  useEffect(() => {
    getSessionClient()
      .then((sess) => {
        setSession(sess);
      })
      .catch(() => {
        setSession(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isAuthPage = pathname === '/app/login' || pathname === '/app/signup';
  const isLoggedIn = !!session?.user;

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-[#E5D9C8]/40 ${
        scrolled || mobileMenuOpen
          ? 'bg-[#FFF8F6]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(55,0,3,0.06)]'
          : 'bg-[#FFF8F6]/60 backdrop-blur-md shadow-[0_2px_10px_rgba(55,0,3,0.03)]'
      }`}
    >
      <div className="h-16 max-w-7xl mx-auto px-4 md:px-16 flex items-center justify-between">
        <Link href="/" onClick={() => setMobileMenuOpen(false)}>
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold transition-colors ${
                  isActive
                    ? 'text-[#370003] font-semibold underline decoration-[#f6be39] decoration-2 underline-offset-8'
                    : 'text-[#564240] hover:text-[#370003]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Buttons */}
        {!isAuthPage ? (
          <div className="hidden md:flex items-center gap-4">
            {authChecked && isLoggedIn ? (
              <Link
                href="/app/dashboard"
                className="bg-[#370003] text-white font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold px-6 py-2 rounded-full hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
              >
                <IconMapper name="dashboard" className="text-[18px]" />
                <span>Dashboard</span>
              </Link>
            ) : authChecked ? (
              <>
                <Link
                  href="/app/login"
                  className="font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold text-[#564240] px-4 py-2 hover:text-[#370003] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/app/signup"
                  className="bg-[#370003] text-white font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold px-6 py-2 rounded-full hover:scale-105 transition-transform shadow-lg"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="w-[180px] h-[36px]" />
            )}
          </div>
        ) : (
          <div className="hidden md:block w-[120px] md:w-[200px]" />
        )}

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {!isAuthPage &&
            authChecked &&
            (isLoggedIn ? (
              <Link
                href="/app/dashboard"
                className="bg-[#370003] text-white font-['Hanken_Grotesk'] text-[12px] font-semibold px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5"
              >
                <IconMapper name="dashboard" className="text-[14px]" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/app/signup"
                className="bg-[#370003] text-white font-['Hanken_Grotesk'] text-[12px] font-semibold px-3.5 py-1.5 rounded-full shadow-sm"
              >
                Get Started
              </Link>
            ))}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 text-[#370003] hover:bg-[#ffe9e5] rounded-lg transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <IconMapper name={mobileMenuOpen ? 'close' : 'menu'} className="text-[24px]" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5D9C8]/40 bg-[#FFF8F6] px-4 py-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-['Hanken_Grotesk'] text-[16px] font-semibold py-2 px-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#ffe9e5] text-[#370003]'
                      : 'text-[#564240] hover:bg-[#fff0ed] hover:text-[#370003]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {!isAuthPage && authChecked && (
            <div className="pt-4 border-t border-[#E5D9C8]/40 flex flex-col gap-2.5">
              {isLoggedIn ? (
                <Link
                  href="/app/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-[#370003] text-white font-['Hanken_Grotesk'] text-[14px] font-semibold py-2.5 rounded-xl shadow-md hover:bg-[#5b060c] transition-colors flex items-center justify-center gap-2"
                >
                  <IconMapper name="dashboard" className="text-[18px]" />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/app/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center font-['Hanken_Grotesk'] text-[14px] font-semibold text-[#564240] py-2.5 rounded-xl border border-[#ddc0bd] hover:bg-[#fff0ed] hover:text-[#370003] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/app/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center bg-[#370003] text-white font-['Hanken_Grotesk'] text-[14px] font-semibold py-2.5 rounded-xl shadow-md hover:bg-[#5b060c] transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

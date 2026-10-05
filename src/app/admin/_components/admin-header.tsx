'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield } from 'lucide-react';

const ROUTE_TITLES: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/users': 'Users & Accounts',
  '/admin/feedback': 'User Feedback',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/payments': 'Payment History',
  '/admin/invoices': 'Invoices & Billing',
  '/admin/pricing': 'Pricing Plans',
  '/admin/audit-log': 'Audit Trail',
};

function getTitle(pathname: string) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith('/admin/users/')) return 'User Details';
  if (pathname.startsWith('/admin/subscriptions/')) return 'Subscription Details';
  return 'Admin Console';
}

interface Props {
  adminName: string;
  adminEmail: string;
}

export function AdminHeader({ adminName, adminEmail }: Props) {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const initials =
    adminName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'A';

  return (
    <header className="h-16 border-b border-[#ddc0bd] bg-[#FFF8EE]/90 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between z-30 shrink-0 select-none font-['Hanken_Grotesk']">
      <div className="flex items-center gap-3">
        <h1 className="font-['Playfair_Display'] text-[20px] lg:text-[22px] font-bold text-[#370003] tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/app/dashboard"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white border border-[#ddc0bd] text-xs font-semibold text-[#564240] hover:text-[#7a1f1f] shadow-xs transition-colors"
        >
          <span>App Dashboard</span>
          <span className="text-[10px] text-[#7a1f1f]">↗</span>
        </Link>
        <span className="hidden md:inline-block text-xs font-medium text-[#564240]">
          {adminEmail}
        </span>
        <div className="flex items-center gap-2 p-1 rounded-full bg-white/60 border border-[#ddc0bd]">
          <div className="w-8 h-8 rounded-full bg-[#370003] text-white flex items-center justify-center font-bold text-xs font-['Playfair_Display'] shadow-xs border border-white">
            {initials}
          </div>
          <span className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-[#7a1f1f] pr-2 uppercase tracking-wider">
            <Shield size={12} />
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CreditCard,
  Receipt,
  FileText,
  Tag,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Logo } from '@/app/app/_components/common/logo';

const NAV = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: ShieldCheck },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Invoices', href: '/admin/invoices', icon: Receipt },
  { label: 'Pricing Plans', href: '/admin/pricing', icon: Tag },
  { label: 'Audit Log', href: '/admin/audit-log', icon: FileText },
];

interface Props {
  adminEmail: string;
  adminName: string;
}

export function AdminSidebar({ adminEmail, adminName }: Props) {
  const pathname = usePathname();
  const initials =
    adminName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'A';

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-56 bg-[#fff8f6] border-r border-[#ddc0bd] z-50 py-6">
      {/* Brand */}
      <div className="px-5 mb-6">
        <Link href="/admin">
          <Logo
            iconClassName="h-7 w-auto"
            textClassName="font-['Playfair_Display'] text-[20px] font-bold text-[#7a1f1f]"
          />
        </Link>
        <p className="font-['Hanken_Grotesk'] text-[10px] leading-[14px] font-bold text-[#7a1f1f] tracking-widest uppercase mt-1">
          Admin Console
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {NAV.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 font-['Hanken_Grotesk'] text-[13px] font-semibold leading-[18px] cursor-pointer ${
                active
                  ? 'text-white bg-[#7a1f1f] shadow-sm shadow-[#7a1f1f]/10'
                  : 'text-[#564240] hover:bg-[#fff0ed] hover:text-[#7a1f1f] hover:translate-x-0.5'
              }`}
            >
              <Icon size={17} className="shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin identity + logout */}
      <div className="px-3 mt-auto pt-3 border-t border-[#ddc0bd]/40 space-y-2">
        <div className="p-2.5 bg-white border border-[#ddc0bd] rounded-xl shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#370003] text-white flex items-center justify-center font-bold text-xs font-['Playfair_Display'] shrink-0 shadow-xs border border-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-['Playfair_Display'] text-[12px] font-bold text-[#2b1611] truncate leading-tight">
                {adminName}
              </p>
              <p className="font-['Hanken_Grotesk'] text-[10px] text-[#564240]/80 truncate">
                {adminEmail}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full mt-2 pt-1.5 border-t border-[#ddc0bd]/30 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#ba1a1a] hover:text-[#7a1f1f] transition-colors cursor-pointer"
          >
            <LogOut size={12} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

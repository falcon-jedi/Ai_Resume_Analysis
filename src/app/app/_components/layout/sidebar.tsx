import { IconMapper } from '@/app/_components/icons/IconMapper';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/app/app/_util/cn';
import { useSubscriptionStatus } from '@/app/app/_hooks/use-subscription';
import { Logo } from '@/app/app/_components/common/logo';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: 'dashboard' },
  { label: 'Build Resume', href: '/app/resume/new', icon: 'edit_note' },
  { label: 'ATS Analyzer', href: '/app/ats-workspace', icon: 'analytics' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: subData, isLoading } = useSubscriptionStatus();
  const plan = subData?.subscription?.plan?.toUpperCase() || 'FREE';
  const planName = subData?.subscription?.planName || plan;
  const isPaidActive = plan !== 'FREE' && subData?.subscription?.status === 'ACTIVE';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'flex flex-col h-screen fixed left-0 top-0 py-5 bg-[#fff8f6] border-r border-[#ddc0bd] z-50 transition-all duration-300 ease-in-out',
          // Responsive widths: mobile 288px (comfortable full drawer), tablet 80px (icon-only), desktop 224px
          'w-72 md:w-20 lg:w-56',
          // Responsive positioning: off-screen on mobile unless open, always visible on tablet/desktop
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Brand */}
        <div className="px-5 md:px-2 lg:px-5 mb-2 md:mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden md:mx-auto lg:mx-0">
            <Logo
              iconClassName="h-7 w-auto shrink-0"
              textClassName="font-['Playfair_Display'] text-[20px] font-bold text-[#7a1f1f] inline-block md:hidden lg:inline-block"
            />
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 -mr-1 rounded-lg text-[#564240] hover:text-[#370003] hover:bg-[#ffe2db]/60 transition cursor-pointer"
            aria-label="Close sidebar"
          >
            <IconMapper name="close" className="text-xl" />
          </button>
        </div>
        <p className="px-5 font-['Hanken_Grotesk'] text-[10px] leading-[14px] font-bold text-[#564240]/60 tracking-widest uppercase mb-4 block md:hidden lg:block">
          AI Career Workshop
        </p>

        {/* Navigation */}
        <nav className="flex-1 px-3 md:px-2 lg:px-3 space-y-1.5 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/app/dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={item.label}
                className={cn(
                  "flex items-center justify-start md:justify-center lg:justify-start gap-3 px-3.5 md:px-3 py-2.5 rounded-lg transition-all duration-200 font-['Hanken_Grotesk'] text-[14px] md:text-[13px] font-semibold leading-[18px] cursor-pointer",
                  isActive
                    ? 'text-white bg-[#7a1f1f] shadow-sm shadow-[#7a1f1f]/10'
                    : 'text-[#564240] hover:bg-[#fff0ed] hover:text-[#7a1f1f] hover:translate-x-0.5',
                )}
              >
                <IconMapper
                  name={item.icon}
                  className="text-[20px] shrink-0"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                />
                <span className="inline-block md:hidden lg:inline-block truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: Subscription */}
        <div className="px-3 md:px-2 lg:px-3 mt-auto pt-3 border-t border-[#ddc0bd]/40">
          {isLoading ? (
            <div className="p-3 bg-[#fff0ed] animate-pulse rounded-xl h-11 border border-[#ddc0bd]/40" />
          ) : !isPaidActive ? (
            <Link
              href="/app/subscription"
              onClick={onClose}
              title="Upgrade to Pro"
              className="block p-2.5 bg-[#f6be39] hover:bg-[#e0ab2b] border border-[#ddc0bd]/40 rounded-xl text-center transition-all group shadow-xs cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1.5">
                <IconMapper
                  name="workspace_premium"
                  className="text-[#261a00] text-sm group-hover:scale-110 transition-transform shrink-0"
                />
                <span className="font-['Hanken_Grotesk'] text-[11px] font-bold text-[#261a00] uppercase tracking-wider inline-block md:hidden lg:inline-block">
                  Upgrade to Pro
                </span>
              </div>
            </Link>
          ) : (
            <Link
              href="/app/settings?section=subscription"
              onClick={onClose}
              title={`${planName} Active`}
              className="block p-2.5 bg-[#fff0ed] hover:bg-[#ffe2db]/60 border border-[#ddc0bd]/40 rounded-xl text-center transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1.5">
                <IconMapper
                  name="verified"
                  className="text-[#7a1f1f] text-sm group-hover:rotate-12 transition-transform shrink-0"
                />
                <span className="font-['Hanken_Grotesk'] text-[11px] font-bold text-[#7a1f1f] uppercase tracking-wider inline-block md:hidden lg:inline-block">
                  {planName} Active
                </span>
              </div>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

import { IconMapper } from '@/app/_components/icons/IconMapper';
/**
 * Reusable primitives for the Settings page.
 * These follow the JobPatra paper/Burgundy design language.
 */

import { cn } from '@/app/app/_util/cn';

// ─── Sheet Card ────────────────────────────────────────────────────────────────
export function SheetCard({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn('rounded-xl p-8', className)}
      style={{
        background: '#FFF8EE',
        border: '1px solid #E5D9C8',
        boxShadow: '0 4px 10px rgba(78,52,46,0.04)',
      }}
    >
      {children}
    </div>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────
export function SectionHeading({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {icon && <IconMapper name={icon} className="text-[#5b060c]" />}
      <h3
        className="text-[24px] leading-[32px] font-semibold text-[#5b060c]"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        {children}
      </h3>
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
export function Toggle({ on = true }: { on?: boolean }) {
  return (
    <div
      className="relative inline-block cursor-pointer transition-colors rounded-full"
      style={{
        width: 44,
        height: 24,
        background: on ? '#5b060c' : '#ddc0bd',
        flexShrink: 0,
      }}
    >
      <div
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
        style={{ [on ? 'right' : 'left']: 4 }}
      />
    </div>
  );
}

// ─── Row Item (for Account/Settings rows) ────────────────────────────────────
export function SettingsRow({
  label,
  description,
  children,
  bordered = true,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-4',
        bordered && 'border-b border-[#E5D9C8]',
      )}
    >
      <div>
        <p
          className="text-[14px] font-semibold text-[#2b1611] leading-[20px]"
          style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
        >
          {label}
        </p>
        {description && (
          <p
            className="text-[13px] text-[#564240] mt-0.5"
            style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
          >
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Burgundy Primary Button ──────────────────────────────────────────────────
export function PrimaryBtn({
  children,
  onClick,
  className,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'bg-[#5b060c] text-white px-8 py-3 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity cursor-pointer',
        className,
      )}
      style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
    >
      {children}
    </button>
  );
}

// ─── Gold Wax Seal Badge ──────────────────────────────────────────────────────
export function WaxSeal() {
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center"
      style={{
        background: 'radial-gradient(circle at 30% 30%, #f6be39, #795900)',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.2), inset -1px -1px 3px rgba(0,0,0,0.3)',
        border: '2px solid #5c4300',
      }}
    >
      <IconMapper
        name="workspace_premium"
        className="text-white"
        style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}
      />
    </div>
  );
}

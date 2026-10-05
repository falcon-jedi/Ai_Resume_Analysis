import { IconMapper } from '@/app/_components/icons/IconMapper';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSubscriptionStatusClient } from '@/app/api/client/payments/payments-client';
import { SheetCard, WaxSeal } from './settings-primitives';

interface ProgressBarProps {
  label: string;
  current: number;
  max: number;
  percent: number;
}

function ProgressBar({ label, current, max, percent }: ProgressBarProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span
          className="text-[14px] font-semibold text-[#2b1611]"
          style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
        >
          {label}
        </span>
        <span
          className="text-[14px] font-semibold text-[#2b1611]"
          style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
        >
          {current} / {max === -1 ? '∞' : max}
        </span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#ffdad2' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(percent, 100)}%`, background: '#795900' }}
        />
      </div>
    </div>
  );
}

export function SubscriptionSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Show payment success banner if redirected from payment flow
    if (searchParams.get('payment') === 'success') {
      setShowSuccess(true);
      // Auto-dismiss after 6 seconds
      const t = setTimeout(() => setShowSuccess(false), 6000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    async function fetchStatus() {
      try {
        const res = await getSubscriptionStatusClient();
        if (res.success && active) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching subscription status:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchStatus();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <SheetCard id="subscription" className="relative animate-pulse">
        <h3
          className="text-[24px] leading-[32px] font-semibold text-[#5b060c] mb-8"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Premium Workshop
        </h3>
        <div className="h-40 bg-[#ddc0bd]/20 rounded-lg"></div>
      </SheetCard>
    );
  }

  const sub = data?.subscription;
  const usage = data?.usage;

  return (
    <div className="space-y-4">
      {/* Payment Success Banner */}
      {showSuccess && (
        <div
          className="flex items-start gap-3 rounded-xl px-5 py-4 animate-in fade-in slide-in-from-top-2"
          style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
          }}
        >
          <IconMapper
            name="check_circle"
            className="text-[#155724] shrink-0 mt-0.5"
            style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
          />
          <div className="flex-1">
            <p
              className="text-[14px] font-bold text-[#155724]"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              Payment Successful! 🎉
            </p>
            <p
              className="text-[13px] text-[#155724] mt-0.5"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              Your subscription has been activated. An invoice will be emailed to you shortly.
            </p>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="text-[#155724] hover:opacity-70 transition-opacity cursor-pointer"
          >
            <IconMapper name="close" className="text-[18px]" />
          </button>
        </div>
      )}

      <SheetCard id="subscription" className="relative">
        <div className="absolute top-6 right-6">
          <WaxSeal />
        </div>

        <h3
          className="text-[24px] leading-[32px] font-semibold text-[#5b060c] mb-8"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Premium Workshop
        </h3>

        <div className="grid grid-cols-2 gap-10">
          {/* Left: plan info & progress bars */}
          <div className="space-y-4">
            <div>
              <p
                className="text-[12px] font-semibold text-[#564240] uppercase tracking-wider mb-1"
                style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
              >
                Current Plan
              </p>
              <p
                className="text-[24px] leading-[32px] font-semibold text-[#795900]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {sub?.planName || 'Free'}
              </p>
            </div>
            <div className="space-y-4">
              <ProgressBar
                label="ATS Analyses"
                current={usage?.atsScans?.current ?? 0}
                max={usage?.atsScans?.max === -1 ? '∞' : (usage?.atsScans?.max ?? 1)}
                percent={usage?.atsScans?.percent ?? 0}
              />
              <ProgressBar
                label="AI Optimization Credits"
                current={usage?.aiOptimizations?.current ?? 0}
                max={usage?.aiOptimizations?.max === -1 ? '∞' : (usage?.aiOptimizations?.max ?? 1)}
                percent={usage?.aiOptimizations?.percent ?? 0}
              />
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-col justify-center space-y-4">
            {sub?.plan !== 'FREE' ? (
              <button
                className="w-full py-3 rounded-lg text-[14px] font-bold tracking-wide cursor-pointer hover:brightness-110 transition-all"
                style={{
                  background: '#f6be39',
                  color: '#261a00',
                  fontFamily: 'Hanken Grotesk, sans-serif',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.1)',
                }}
                onClick={() => router.push('/app/billing')}
              >
                Manage Billing
              </button>
            ) : (
              <div className="text-[12px] text-center text-[#564240] font-semibold">
                Upgrade to unleash full premium features
              </div>
            )}
            <button
              className="w-full py-3 border-2 border-[#ddc0bd] text-[#564240] rounded-lg text-[14px] font-semibold hover:bg-[#ffe9e4] transition-colors cursor-pointer"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
              onClick={() => router.push('/app/subscription')}
            >
              Upgrade Plan
            </button>
            {sub?.currentPeriodEnd && (
              <p
                className="text-[10px] text-center text-[#564240] italic"
                style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
              >
                Next billing cycle:{' '}
                {new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
      </SheetCard>
    </div>
  );
}

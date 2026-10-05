'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

interface PaymentProcessingOverlayProps {
  planName?: string;
}

export function PaymentProcessingOverlay({ planName }: PaymentProcessingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(43, 22, 17, 0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative max-w-md w-full mx-4 rounded-2xl p-10 flex flex-col items-center text-center"
        style={{
          background: '#FFF8EE',
          border: '1px solid #E5D9C8',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >
        {/* Animated Wax Seal Spinner */}
        <div className="relative mb-8">
          {/* Outer spinning ring */}
          <div
            className="w-20 h-20 rounded-full animate-spin"
            style={{
              border: '3px solid #ffdad2',
              borderTopColor: '#5b060c',
              borderRightColor: '#795900',
            }}
          />
          {/* Inner seal icon */}
          <div
            className="absolute inset-0 flex items-center justify-center w-20 h-20 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #f6be39, #795900)',
              margin: '6px',
              width: 'calc(100% - 12px)',
              height: 'calc(100% - 12px)',
              boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.3)',
            }}
          >
            <IconMapper
              name="workspace_premium"
              className="text-white"
              style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}
            />
          </div>
        </div>

        {/* Text */}
        <h2
          className="text-[24px] leading-[32px] font-semibold text-[#5b060c] mb-3"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Activating Your Subscription
        </h2>
        {planName && (
          <p
            className="text-[15px] text-[#795900] font-semibold mb-2"
            style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
          >
            {planName} Plan
          </p>
        )}
        <p
          className="text-[14px] text-[#564240] mb-8 leading-relaxed"
          style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
        >
          Verifying your payment and setting up your account. This will take just a moment.
        </p>

        {/* Warning Banner */}
        <div
          className="w-full flex items-start gap-3 rounded-lg px-4 py-3"
          style={{ background: '#fff3cd', border: '1px solid #f6be39' }}
        >
          <IconMapper
            name="warning"
            className="text-[#795900] shrink-0 mt-0.5"
            style={{ fontSize: 18 }}
          />
          <p
            className="text-[13px] text-[#5c4300] text-left leading-snug"
            style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
          >
            <strong>Do not close this tab or press back.</strong> Your payment is being confirmed
            with our servers. Leaving this page may delay activation.
          </p>
        </div>

        {/* Animated progress dots */}
        <div className="flex gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                background: '#5b060c',
                animationDelay: `${i * 0.2}s`,
                animationDuration: '0.8s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

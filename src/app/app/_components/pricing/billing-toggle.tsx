import React from 'react';

interface BillingToggleProps {
  isYearly: boolean;
  onToggle: () => void;
  discountPercentage: number;
}

export function BillingToggle({ isYearly, onToggle, discountPercentage }: BillingToggleProps) {
  return (
    <div className="mt-12 flex items-center justify-center gap-4">
      <span
        className={`font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold transition-colors ${!isYearly ? 'text-[#2b1611]' : 'text-[#564240]'}`}
      >
        Monthly
      </span>
      <button
        onClick={onToggle}
        className="relative w-14 h-7 bg-[#ffe2db] rounded-full p-1 transition-colors hover:bg-[#ffdad2] focus:outline-none"
        id="billing-toggle"
        aria-label="Toggle billing interval"
      >
        <div
          className={`w-5 h-5 bg-[#5b060c] rounded-full transition-transform duration-300 ease-in-out transform ${
            isYearly ? 'translate-x-7' : 'translate-x-0'
          }`}
          id="toggle-circle"
        ></div>
      </button>
      <span
        className={`font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold transition-colors ${isYearly ? 'text-[#2b1611]' : 'text-[#564240]'}`}
      >
        Quarterly
      </span>
      {discountPercentage > 0 && (
        <span className="bg-[#ffc641] text-[#715300] text-[10px] font-bold px-2 py-0.5 rounded-full">
          SAVE {discountPercentage}%
        </span>
      )}
    </div>
  );
}

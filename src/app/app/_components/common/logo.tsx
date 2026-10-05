'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  textClassName?: string;
}

export function LogoIcon({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circular container with deep burgundy fill */}
      <circle cx="18" cy="18" r="18" fill="#370003" />
      {/* Digital Nib body */}
      <path
        d="M18 5.5L25.5 15V24.5C25.5 26.1569 24.1569 27.5 22.5 27.5H13.5C11.8431 27.5 10.5 26.1569 10.5 24.5V15L18 5.5Z"
        fill="#FFF8F6"
      />
      {/* Breather hole */}
      <circle cx="18" cy="18" r="2.25" fill="#370003" />
      {/* Nib slit */}
      <path d="M18 5.5V15.75" stroke="#370003" strokeWidth="1.5" strokeLinecap="round" />
      {/* Wax Gold accent line */}
      <path d="M14 23.5H22" stroke="#f6be39" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({
  className = '',
  iconClassName = 'h-7 w-auto',
  showText = true,
  textClassName = "font-['Playfair_Display'] text-[24px] leading-[32px] font-semibold text-[#370003]",
}: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon className={iconClassName} />
      {showText && <span className={textClassName}>JobPatra</span>}
    </div>
  );
}

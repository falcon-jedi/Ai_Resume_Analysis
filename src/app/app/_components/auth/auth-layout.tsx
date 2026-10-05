'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useEffect, useRef } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const decor1Ref = useRef<HTMLSpanElement>(null);
  const decor2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.005;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.005;

      if (decor1Ref.current) {
        decor1Ref.current.style.transform = `translate(${moveX}px, ${moveY}px) rotate(-12deg)`;
      }
      if (decor2Ref.current) {
        decor2Ref.current.style.transform = `translate(${-moveX}px, ${-moveY}px) rotate(12deg)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="auth-desk-base font-['Hanken_Grotesk'] text-[#2b1611] min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#5b060c]/20 selection:text-[#5b060c]">
      {/* Paper Texture Overlay */}
      <div className="fixed inset-0 auth-paper-texture pointer-events-none z-50"></div>

      {/* Background Decorative Elements (The Desk) */}
      <div className="absolute top-28 left-10 opacity-20 transform -rotate-12 select-none pointer-events-none hidden md:block">
        <IconMapper
          name="history_edu"
          ref={decor1Ref}
          className="text-[120px] text-[#ffb3ae] transition-transform duration-100 ease-out"
        />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20 transform rotate-12 select-none pointer-events-none hidden md:block">
        <IconMapper
          name="ink_pen"
          ref={decor2Ref}
          className="text-[120px] text-[#ffb3ae] transition-transform duration-100 ease-out"
          style={{ fontVariationSettings: "'FILL' 1" }}
        />
      </div>

      {/* Centered Page Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 w-full max-w-7xl mx-auto relative z-10">
        {children}
      </div>
    </div>
  );
}

'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { logoutClient } from '@/app/api/client/auth/auth-client';

export function LogoutButton() {
  const handleLogout = async () => {
    await logoutClient('/'); // redirects to landing page
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 bg-white/45 border border-[#ddc0bd] text-[#564240] hover:text-[#5b060c] hover:bg-[#fff0ed] px-5 py-2 rounded-none font-['Hanken_Grotesk'] text-[14px] font-semibold tracking-wider uppercase transition-all duration-200 active:scale-95 cursor-pointer"
    >
      <IconMapper name="logout" className="text-[18px]" />
      Logout
    </button>
  );
}

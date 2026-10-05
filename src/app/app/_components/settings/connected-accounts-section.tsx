'use client';

import { SheetCard, SectionHeading } from './settings-primitives';

interface Connection {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
}

const CONNECTIONS: Connection[] = [
  {
    id: 'google',
    name: 'Google',
    description: 'Calendar & Drive Access',
    icon: 'G',
    connected: true,
  },
  { id: 'linkedin', name: 'LinkedIn', description: 'Profile Syncing', icon: 'in', connected: true },
  { id: 'github', name: 'GitHub', description: 'Portfolio Projects', icon: '◎', connected: false },
  { id: 'indeed', name: 'Indeed', description: 'Auto-Apply Sync', icon: 'i', connected: false },
];

export function ConnectedAccountsSection() {
  return (
    <SheetCard id="connected">
      <SectionHeading icon="link">External Connections</SectionHeading>
      <div className="grid grid-cols-2 gap-4">
        {CONNECTIONS.map((conn) => (
          <div
            key={conn.id}
            className="flex items-center justify-between p-4 border border-[#E5D9C8] rounded-lg hover:border-[#5b060c]/40 transition-all"
            style={{ background: '#FFF8EE' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#E5D9C8]">
                <span
                  className="text-[14px] font-bold text-[#5b060c]"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {conn.icon}
                </span>
              </div>
              <div>
                <p
                  className="text-[14px] font-semibold text-[#2b1611]"
                  style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                >
                  {conn.name}
                </p>
                <p
                  className="text-[10px] text-[#564240]"
                  style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                >
                  {conn.description}
                </p>
              </div>
            </div>
            {conn.connected ? (
              <span
                className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded"
                style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
              >
                CONNECTED
              </span>
            ) : (
              <button
                className="text-[10px] font-bold text-[#5b060c] border border-[#5b060c] px-3 py-1 rounded hover:bg-[#5b060c] hover:text-white transition-all"
                style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                onClick={() => alert(`Connect ${conn.name}`)}
              >
                CONNECT
              </button>
            )}
          </div>
        ))}
      </div>
    </SheetCard>
  );
}

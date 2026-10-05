'use client';

import { QueryProvider } from '@/app/app/providers/query-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

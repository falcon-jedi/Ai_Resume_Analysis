import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { AdminSidebar } from './_components/admin-sidebar';
import { AdminHeader } from './_components/admin-header';
import { Toaster } from 'sonner';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/app/dashboard');

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F2E8] text-[#2b1611] antialiased relative font-['Hanken_Grotesk']">
      {/* Paper Texture Overlay */}
      <div className="fixed inset-0 auth-paper-texture pointer-events-none z-50"></div>
      <Toaster position="top-right" richColors />
      <AdminSidebar
        adminEmail={session.user.email ?? ''}
        adminName={session.user.name ?? 'Admin'}
      />
      <main className="md:ml-56 flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <AdminHeader
          adminName={session.user.name ?? 'Admin'}
          adminEmail={session.user.email ?? ''}
        />
        <div className="flex-1 overflow-y-auto w-full no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">{children}</div>
        </div>
      </main>
    </div>
  );
}

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/(controller)/auth/[...nextauth]/options';
import { prisma } from '@/app/_lib/prisma';

export const metadata: Metadata = { title: 'Payments | JobPatra Admin' };

const PAGE_SIZE = 20;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/app/dashboard');

  const { page: pageStr = '1' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.payment.count(),
  ]);

  const fmt = (n: number, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  const STATUS_BADGE: Record<string, string> = {
    COMPLETED: 'bg-[#dcfce7] text-[#166534] border border-[#86efac]',
    PENDING: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
    FAILED: 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]',
  };

  return (
    <div className="space-y-4 font-['Hanken_Grotesk']">
      <p className="text-xs font-semibold text-[#564240]">{total} total payment transactions</p>
      <div className="bg-white border border-[#ddc0bd] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ddc0bd] bg-[#fff8f6] text-[#564240] text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3.5 font-bold">User</th>
                <th className="text-left px-5 py-3.5 font-bold">Amount</th>
                <th className="text-left px-5 py-3.5 font-bold">Status</th>
                <th className="text-left px-5 py-3.5 font-bold hidden md:table-cell">
                  Razorpay Order
                </th>
                <th className="text-left px-5 py-3.5 font-bold hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ddc0bd]/50">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-[#fff0ed]/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-[#2b1611]">{p.user.name ?? '—'}</p>
                    <p className="text-xs text-[#564240] mt-0.5">{p.user.email}</p>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-[#166534]">
                    {fmt(p.amount, p.currency)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_BADGE[p.status] ?? ''}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#564240] font-mono hidden md:table-cell">
                    {p.razorpayOrderId}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#564240] font-medium hidden md:table-cell">
                    {p.createdAt.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ponytail: simple offset pagination, good enough for a read-only admin list */}
      {Math.ceil(total / PAGE_SIZE) > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), page + 2)
            .map((p) => (
              <a
                key={p}
                href={`/admin/payments?page=${p}`}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-2xs ${
                  p === page
                    ? 'bg-[#5b060c] text-white border-[#5b060c]'
                    : 'bg-white border-[#ddc0bd] text-[#564240] hover:text-[#2b1611] hover:bg-[#fff0ed]'
                }`}
              >
                {p}
              </a>
            ))}
        </div>
      )}
    </div>
  );
}

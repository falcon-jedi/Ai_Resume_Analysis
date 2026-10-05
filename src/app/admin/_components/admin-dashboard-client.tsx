'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, CreditCard, TrendingUp, MessageSquare } from 'lucide-react';

interface Stats {
  totalUsers: number;
  newUsersThisMonth: number;
  activeSubscriptions: number;
  totalRevenue: number;
  pendingFeedback: number;
}

interface ChartPoint {
  date: string;
  users: number;
  revenue: number;
}
interface Activity {
  id: string;
  userName: string;
  amount: number;
  currency: string;
  createdAt: string;
}

interface Props {
  stats: Stats;
  chartData: ChartPoint[];
  recentActivity: Activity[];
}

const KPI_CARDS = (stats: Stats) => [
  {
    label: 'Total Users',
    value: stats.totalUsers.toLocaleString(),
    sub: `+${stats.newUsersThisMonth} this month`,
    icon: Users,
    color: 'text-[#7a1f1f]',
    bg: 'bg-[#fff0ed]',
  },
  {
    label: 'Active Subscriptions',
    value: stats.activeSubscriptions.toLocaleString(),
    sub: 'Paid plans',
    icon: CreditCard,
    color: 'text-[#166534]',
    bg: 'bg-[#dcfce7]',
  },
  {
    label: 'Total Revenue',
    value: new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(stats.totalRevenue),
    sub: 'All time',
    icon: TrendingUp,
    color: 'text-[#7a1f1f]',
    bg: 'bg-[#fff0ed]',
  },
  {
    label: 'Pending Feedback',
    value: stats.pendingFeedback.toLocaleString(),
    sub: 'Awaiting review',
    icon: MessageSquare,
    color: 'text-[#92400e]',
    bg: 'bg-[#fef3c7]',
  },
];

export function AdminDashboardClient({ stats, chartData, recentActivity }: Props) {
  const kpis = KPI_CARDS(stats);
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-6 font-['Hanken_Grotesk']">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white border border-[#ddc0bd] rounded-xl p-5 flex items-start gap-4 shadow-xs"
          >
            <div className={`${bg} p-2.5 rounded-lg shrink-0`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-[11px] text-[#564240] font-bold uppercase tracking-wider">
                {label}
              </p>
              <p className="text-2xl font-bold text-[#2b1611] font-['Playfair_Display'] mt-0.5">
                {value}
              </p>
              <p className="text-xs text-[#564240]/80 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* User Growth */}
        <div className="bg-white border border-[#ddc0bd] rounded-xl p-5 shadow-xs">
          <p className="text-base font-bold text-[#2b1611] font-['Playfair_Display'] mb-4">
            User Growth (14 days)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="users-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7a1f1f" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7a1f1f" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddc0bd" strokeOpacity={0.4} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#564240', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#564240', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #ddc0bd',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#2b1611',
                }}
                labelStyle={{ color: '#2b1611', fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#7a1f1f"
                strokeWidth={2.5}
                fill="url(#users-grad)"
                dot={{ fill: '#7a1f1f', r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="bg-white border border-[#ddc0bd] rounded-xl p-5 shadow-xs">
          <p className="text-base font-bold text-[#2b1611] font-['Playfair_Display'] mb-4">
            Daily Revenue (14 days)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#166534" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#166534" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddc0bd" strokeOpacity={0.4} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#564240', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#564240', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #ddc0bd',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#2b1611',
                }}
                labelStyle={{ color: '#2b1611', fontWeight: 600 }}
                formatter={(val: unknown) => [fmt(val as number), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#166534"
                strokeWidth={2.5}
                fill="url(#rev-grad)"
                dot={{ fill: '#166534', r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white border border-[#ddc0bd] rounded-xl p-5 shadow-xs">
        <p className="text-base font-bold text-[#2b1611] font-['Playfair_Display'] mb-4">
          Recent Payments
        </p>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-[#564240]">No payments recorded yet.</p>
        ) : (
          <div className="divide-y divide-[#ddc0bd]/50">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-[#2b1611]">{a.userName}</p>
                  <p className="text-xs text-[#564240]">
                    {new Date(a.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className="text-sm font-bold text-[#166534] bg-[#dcfce7] px-2.5 py-1 rounded-md">
                  {fmt(a.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

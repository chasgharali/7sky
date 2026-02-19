"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

interface DashboardData {
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  reservedUnits: number;
  totalRevenue: number;
  outstandingPayments: number;
  totalOwners: number;
  bookingPct: number;
  pendingBookingRequests: number;
  totalUnitsValue: number;
  totalArea: number;
  revenueByMonth: { _id: string; total: number }[];
  dueAlerts: {
    id: string;
    ownerName: string;
    registrationNumber: string;
    unitNumber?: string;
    totalAmount: number;
    amountPaid: number;
    pendingAmount: number;
    nextDue: string | null;
  }[];
}

interface InstallmentAlert {
  ownerId: string;
  ownerName: string;
  unitNumber: string;
  installmentLabel: string;
  dueDate: string;
  amount: number;
  type: "overdue" | "upcoming";
}

function formatPKR(n: number | undefined | null) {
  if (n == null) return "Rs. 0";
  if (n >= 10000000) return `Rs. ${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `Rs. ${(n / 100000).toFixed(1)}L`;
  return `Rs. ${n.toLocaleString()}`;
}

function RadialProgress({ pct, size = 120 }: { pct: number; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth={10} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="url(#grad)" strokeWidth={10}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;      // top bar colour class e.g. "bg-emerald-500"
  iconBg: string;      // icon container bg e.g. "bg-emerald-500/15"
  icon: React.ReactNode;
  href?: string;
}

function StatCard({ label, value, sub, accent, iconBg, icon, href }: StatCardProps) {
  const inner = (
    <div className="relative bg-zinc-900 border border-white/[0.06] rounded-2xl overflow-hidden group hover:border-white/[0.12] transition-all duration-200 h-full flex flex-col">
      {/* Thin coloured top accent */}
      <div className={`h-0.5 w-full ${accent}`} />
      <div className="flex flex-col flex-1 p-4">
        {/* Label row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">{label}</p>
          <div className={`p-1.5 rounded-lg ${iconBg} shrink-0`}>{icon}</div>
        </div>
        {/* Value */}
        <p className="text-2xl font-black text-white leading-none break-all">{value}</p>
        {/* Sub */}
        {sub && <p className="text-[11px] text-zinc-600 mt-1.5 truncate">{sub}</p>}
        {/* Hover cue */}
        {href && (
          <p className="text-[10px] text-zinc-700 group-hover:text-zinc-400 transition mt-auto pt-2">
            View →
          </p>
        )}
      </div>
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner;
}

const PIE_COLORS = ["#22c55e", "#ef4444", "#f59e0b"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [installments, setInstallments] = useState<{ overdue: InstallmentAlert[]; upcoming30Days: InstallmentAlert[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/dashboard", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/installments", { credentials: "include" }).then((r) => r.json()).catch(() => null),
    ]).then(([dash, inst]) => {
      setData(dash);
      if (inst) setInstallments(inst);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-zinc-800 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-72 bg-zinc-800 rounded-2xl" />
          <div className="h-72 bg-zinc-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-400 font-semibold">Failed to load dashboard</p>
        <button onClick={() => window.location.reload()} className="text-xs text-zinc-500 hover:text-white underline">Retry</button>
      </div>
    );
  }

  const soldPct = data.totalUnits > 0 ? Math.round((data.soldUnits / data.totalUnits) * 100) : 0;

  const statCards: StatCardProps[] = [
    {
      label: "Total Units", value: data.totalUnits, sub: "All floors",
      accent: "bg-blue-500", iconBg: "bg-blue-500/15",
      icon: <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
      href: "/admin/units",
    },
    {
      label: "Available", value: data.availableUnits, sub: "Open for sale",
      accent: "bg-emerald-500", iconBg: "bg-emerald-500/15",
      icon: <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Sold", value: data.soldUnits, sub: `${soldPct}% of total`,
      accent: "bg-red-500", iconBg: "bg-red-500/15",
      icon: <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    },
    {
      label: "Reserved", value: data.reservedUnits, sub: "Pending confirmation",
      accent: "bg-amber-500", iconBg: "bg-amber-500/15",
      icon: <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Revenue", value: formatPKR(data.totalRevenue), sub: "Collected to date",
      accent: "bg-purple-500", iconBg: "bg-purple-500/15",
      icon: <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Outstanding", value: formatPKR(data.outstandingPayments), sub: "Pending collections",
      accent: "bg-orange-500", iconBg: "bg-orange-500/15",
      icon: <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
      href: "/admin/payments",
    },
    {
      label: "Project Value", value: formatPKR(data.totalUnitsValue), sub: "All units combined",
      accent: "bg-teal-500", iconBg: "bg-teal-500/15",
      icon: <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      href: "/admin/units",
    },
    {
      label: "Total Area", value: `${(data.totalArea ?? 0).toLocaleString()} sq ft`, sub: "Combined all units",
      accent: "bg-sky-500", iconBg: "bg-sky-500/15",
      icon: <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
      href: "/admin/units",
    },
  ];

  const pieData = [
    { name: "Available", value: data.availableUnits },
    { name: "Sold", value: data.soldUnits },
    { name: "Reserved", value: data.reservedUnits },
  ].filter((d) => d.value > 0);

  const overdueAlerts = installments?.overdue ?? [];
  const upcomingAlerts = installments?.upcoming30Days ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Real-time overview of 7Sky project</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-800/60 px-3 py-2 rounded-xl border border-white/[0.06]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live data
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Booking % + Pending Bookings + Quick Actions row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Booking progress ring */}
        <div className="bg-zinc-900 border border-white/[0.06] rounded-2xl p-5 flex items-center gap-5">
          <div className="relative shrink-0">
            <RadialProgress pct={data.bookingPct} size={100} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-white font-black text-lg leading-none">{data.bookingPct}%</p>
                <p className="text-zinc-500 text-[10px]">booked</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Booking Progress</p>
            <p className="text-zinc-400 text-xs mt-1">{data.soldUnits + data.reservedUnits} of {data.totalUnits} units</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-zinc-400">{data.soldUnits} sold</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-zinc-400">{data.reservedUnits} reserved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Bookings */}
        <Link href="/admin/bookings" className="bg-zinc-900 border border-white/[0.06] rounded-2xl p-5 hover:bg-zinc-800/60 transition group flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Pending Requests</p>
              <p className="text-4xl font-black text-white mt-2">{data.pendingBookingRequests}</p>
              <p className="text-zinc-500 text-xs mt-1">Booking requests to review</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-600/20">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          {data.pendingBookingRequests > 0 && (
            <div className="mt-3 flex items-center gap-1 text-xs text-blue-400 group-hover:text-blue-300">
              Review now →
            </div>
          )}
        </Link>

        {/* Overdue installments summary */}
        <div className="bg-zinc-900 border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Overdue Installments</p>
              <p className="text-4xl font-black text-white mt-2">{overdueAlerts.length}</p>
              <p className="text-zinc-500 text-xs mt-1">{upcomingAlerts.length} due in 30 days</p>
            </div>
            <div className={`p-2.5 rounded-xl ${overdueAlerts.length > 0 ? "bg-red-500/20" : "bg-emerald-500/20"}`}>
              <svg className={`w-5 h-5 ${overdueAlerts.length > 0 ? "text-red-400" : "text-emerald-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {overdueAlerts.length > 0 && (
            <div className="mt-3 text-xs text-red-400">Action required ↓</div>
          )}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-zinc-900 border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Revenue by Month</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Monthly payment collections</p>
            </div>
            <span className="text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2.5 py-1 rounded-lg">PKR</span>
          </div>
          {data.revenueByMonth && data.revenueByMonth.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.revenueByMonth} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="_id" stroke="#52525b" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#52525b" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : String(v)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px" }}
                    labelStyle={{ color: "#a1a1aa", fontSize: 11 }}
                    formatter={(value: number | undefined) => [formatPKR(value ?? 0), "Revenue"]}
                  />
                  <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-zinc-600 text-sm">No revenue data yet</div>
          )}
        </div>

        <div className="bg-zinc-900 border border-white/[0.06] rounded-2xl p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-white">Unit Status</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Breakdown by availability</p>
          </div>
          {pieData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px" }}
                    formatter={(value) => [`${value ?? 0} units`, ""]}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#71717a", paddingTop: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-zinc-600 text-sm">No unit data</div>
          )}
        </div>
      </div>

      {/* Installment Alerts */}
      {(overdueAlerts.length > 0 || upcomingAlerts.length > 0) && (
        <div className="bg-zinc-900 border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Installment Alerts</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Based on payment plan schedules</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {overdueAlerts.length > 0 && (
                <span className="text-xs bg-red-600/20 text-red-400 border border-red-600/30 px-2.5 py-1 rounded-lg font-semibold">
                  {overdueAlerts.length} overdue
                </span>
              )}
              {upcomingAlerts.length > 0 && (
                <span className="text-xs bg-amber-600/20 text-amber-400 border border-amber-600/30 px-2.5 py-1 rounded-lg font-semibold">
                  {upcomingAlerts.length} upcoming
                </span>
              )}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-white/[0.04]">
            {[...overdueAlerts, ...upcomingAlerts].slice(0, 12).map((a, i) => (
              <div key={i} className="px-5 py-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{a.ownerName}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{a.installmentLabel}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs border border-white/10">{a.unitNumber}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      a.type === "overdue" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {a.type === "overdue" ? "Overdue" : "Upcoming"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Due: <span className="text-zinc-300">{a.dueDate}</span></span>
                  <span className="text-amber-400 font-bold">{formatPKR(a.amount)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="text-left border-b border-white/[0.04]">
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">Owner</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">Unit</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">Instalment</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">Due Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...overdueAlerts, ...upcomingAlerts].slice(0, 12).map((a, i) => (
                  <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3 text-white font-medium text-sm whitespace-nowrap">{a.ownerName}</td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs border border-white/10">{a.unitNumber}</span>
                    </td>
                    <td className="px-6 py-3 text-zinc-400 text-sm whitespace-nowrap">{a.installmentLabel}</td>
                    <td className="px-6 py-3 text-zinc-400 text-sm whitespace-nowrap">{a.dueDate}</td>
                    <td className="px-6 py-3 text-amber-400 font-bold text-sm whitespace-nowrap">{formatPKR(a.amount)}</td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        a.type === "overdue" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {a.type === "overdue" ? "Overdue" : "Upcoming"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Due Payment Alerts */}
      <div className="bg-zinc-900 border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Due Payment Alerts</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Owners with outstanding balances</p>
          </div>
          {data.dueAlerts && data.dueAlerts.length > 0 && (
            <span className="text-xs bg-red-600/20 text-red-400 border border-red-600/30 px-2.5 py-1 rounded-lg font-semibold">
              {data.dueAlerts.length} pending
            </span>
          )}
        </div>

        {data.dueAlerts && data.dueAlerts.length > 0 ? (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-white/[0.04]">
              {data.dueAlerts.slice(0, 10).map((a) => {
                const paidPct = a.totalAmount > 0 ? Math.round((a.amountPaid / a.totalAmount) * 100) : 0;
                const isOverdue = a.nextDue ? new Date(a.nextDue) < new Date() : false;
                return (
                  <div key={a.id} className="px-5 py-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                          {a.ownerName?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{a.ownerName}</p>
                          <p className="text-zinc-500 text-xs font-mono">{a.registrationNumber}</p>
                        </div>
                      </div>
                      {a.unitNumber && (
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs border border-white/10 shrink-0">{a.unitNumber}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-emerald-400">{formatPKR(a.amountPaid)} paid</span>
                        <span className="text-zinc-500">{paidPct}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${paidPct}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-zinc-800/60 rounded-xl p-2">
                        <p className="text-[10px] text-zinc-500 uppercase">Total</p>
                        <p className="text-xs font-semibold text-zinc-300 mt-0.5">{formatPKR(a.totalAmount)}</p>
                      </div>
                      <div className="bg-zinc-800/60 rounded-xl p-2">
                        <p className="text-[10px] text-zinc-500 uppercase">Pending</p>
                        <p className="text-xs font-semibold text-amber-400 mt-0.5">{formatPKR(a.pendingAmount)}</p>
                      </div>
                      <div className="bg-zinc-800/60 rounded-xl p-2">
                        <p className="text-[10px] text-zinc-500 uppercase">Next Due</p>
                        {a.nextDue ? (
                          <p className={`text-xs font-semibold mt-0.5 ${isOverdue ? "text-red-400" : "text-zinc-300"}`}>
                            {a.nextDue.split("T")[0]}
                            {isOverdue && <span className="block text-[9px] text-red-500 uppercase">overdue</span>}
                          </p>
                        ) : (
                          <p className="text-xs font-semibold text-emerald-400 mt-0.5">Paid up</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {data.dueAlerts.length > 10 && (
                <div className="px-5 py-3 border-t border-white/[0.04]">
                  <Link href="/admin/payments" className="text-xs text-blue-400 hover:underline">
                    View all {data.dueAlerts.length} alerts →
                  </Link>
                </div>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="text-left border-b border-white/[0.04]">
                    {["Owner", "Reg. No.", "Unit", "Total", "Paid", "Pending", "Progress", "Next Due"].map((h) => (
                      <th key={h} className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.dueAlerts.slice(0, 10).map((a, i) => {
                    const paidPct = a.totalAmount > 0 ? Math.round((a.amountPaid / a.totalAmount) * 100) : 0;
                    const isOverdue = a.nextDue ? new Date(a.nextDue) < new Date() : false;
                    return (
                      <tr key={a.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? "" : "bg-zinc-800/20"}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
                              {a.ownerName?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <span className="text-white font-medium text-sm">{a.ownerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 text-sm font-mono whitespace-nowrap">{a.registrationNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {a.unitNumber ? (
                            <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs border border-white/10">{a.unitNumber}</span>
                          ) : <span className="text-zinc-600">—</span>}
                        </td>
                        <td className="px-6 py-4 text-zinc-300 text-sm whitespace-nowrap">{formatPKR(a.totalAmount)}</td>
                        <td className="px-6 py-4 text-emerald-400 text-sm font-semibold whitespace-nowrap">{formatPKR(a.amountPaid)}</td>
                        <td className="px-6 py-4 font-bold text-amber-400 text-sm whitespace-nowrap">{formatPKR(a.pendingAmount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${paidPct}%` }} />
                            </div>
                            <span className="text-zinc-500 text-xs">{paidPct}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {a.nextDue ? (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                              isOverdue ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-zinc-800 text-zinc-300 border-white/10"
                            }`}>
                              {a.nextDue}
                              {isOverdue && <span className="ml-1.5 text-[9px] uppercase font-bold text-red-400">overdue</span>}
                            </span>
                          ) : (
                            <span className="text-emerald-400 text-xs font-semibold">Paid up</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {data.dueAlerts.length > 10 && (
                <div className="px-6 py-3 border-t border-white/[0.04]">
                  <Link href="/admin/payments" className="text-xs text-blue-400 hover:underline">
                    View all {data.dueAlerts.length} alerts →
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-zinc-500 text-sm font-medium">All payments up to date</p>
          </div>
        )}
      </div>
    </div>
  );
}

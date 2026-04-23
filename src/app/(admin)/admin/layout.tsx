"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AdminThemeProvider } from "./admin-theme";

interface InstallmentAlert {
  ownerId: string;
  ownerName: string;
  unitNumber: string;
  installmentLabel: string;
  dueDate: string;
  amount: number;
  type: "overdue" | "upcoming";
}

const NAV_ITEMS = [
  {
    href: "/admin/dashboard", label: "Dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/admin/units", label: "Units",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: "/admin/owners", label: "Owners",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/payments", label: "Payments",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/payment-plan", label: "Payment Plan",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/bookings", label: "Bookings",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/media", label: "Media",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

function NotificationBell() {
  const [alerts, setAlerts] = useState<InstallmentAlert[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/installments", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.overdue || d.upcoming30Days) {
          setAlerts([...(d.overdue || []), ...(d.upcoming30Days || [])]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const overdueCount = alerts.filter((a) => a.type === "overdue").length;
  const totalCount = alerts.length;

  function formatPKR(n: number) {
    if (n >= 10000000) return `Rs.${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `Rs.${(n / 100000).toFixed(1)}L`;
    return `Rs.${n.toLocaleString()}`;
  }

  return (
    <div ref={ref} className="relative z-[70]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {totalCount > 0 && (
          <span className="admin-counter-badge absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-[80] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Installment Alerts</p>
              {overdueCount > 0 && (
                <p className="text-red-400 text-xs mt-0.5">{overdueCount} overdue</p>
              )}
            </div>
            {totalCount === 0 && <p className="text-gray-500 text-xs">All clear</p>}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">No upcoming alerts</div>
            ) : (
              alerts.map((a, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition ${
                    a.type === "overdue" ? "border-l-2 border-l-red-500/60" : "border-l-2 border-l-amber-500/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium truncate">{a.ownerName}</p>
                      <p className="text-gray-400 text-[11px]">
                        {a.unitNumber} · {a.installmentLabel}
                      </p>
                      <p className="text-gray-500 text-[11px]">Due: {a.dueDate}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-amber-400 text-xs font-bold">{formatPKR(a.amount)}</p>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          a.type === "overdue"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {a.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {alerts.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/10">
              <Link
                href="/admin/dashboard"
                onClick={() => setOpen(false)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                View all on dashboard →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCounts, setSidebarCounts] = useState({ pendingBookings: 0, overdueInstallments: 0 });
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Fetch sidebar counts once on mount
  useEffect(() => {
    fetch("/api/admin/sidebar-counts", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.pendingBookings !== undefined) setSidebarCounts(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin-theme");
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      }
    } catch {
      // Ignore storage failures and keep default.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("admin-theme", theme);
    } catch {
      // Ignore storage failures.
    }
  }, [theme]);

  if (pathname === "/admin/login") {
    return (
      <AdminThemeProvider value={theme}>
        <div className="admin-theme-root admin-page" data-admin-theme={theme}>
          {children}
        </div>
      </AdminThemeProvider>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const currentNav = NAV_ITEMS.find((n) => n.href === pathname);

  return (
    <AdminThemeProvider value={theme}>
    <div className="admin-theme-root admin-page min-h-screen bg-zinc-950 flex" data-admin-theme={theme}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-40 md:z-auto w-60 bg-zinc-900 border-r border-white/[0.06] flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/[0.06]">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image
              src="/media/logos/one-capital-logo.png"
              alt="One Capital"
              width={44}
              height={44}
              className="w-11 h-11 object-contain shrink-0"
            />
            <div>
              <p className="text-white font-bold text-sm leading-tight">7Sky Admin</p>
              <p className="text-zinc-500 text-[10px]">One Capital Builders</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-2 pb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Navigation</p>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group ${
                  active
                    ? theme === "light"
                      ? "bg-blue-50 text-blue-900 border border-blue-100 shadow-sm"
                      : "bg-blue-600/15 text-white"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full" />
                )}
                <span
                  className={
                    active
                      ? theme === "light"
                        ? "text-blue-700"
                        : "text-blue-400"
                      : "text-zinc-600 group-hover:text-zinc-400 transition"
                  }
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.href === "/admin/bookings" && sidebarCounts.pendingBookings > 0 && (
                  <span className="admin-counter-badge text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                    {sidebarCounts.pendingBookings}
                  </span>
                )}
                {item.href === "/admin/owners" && sidebarCounts.overdueInstallments > 0 && (
                  <span className="admin-counter-badge text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                    {sidebarCounts.overdueInstallments}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2.5 py-3 border-t border-white/[0.06] space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-red-500/80 hover:text-red-400 hover:bg-red-500/[0.08] transition text-left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main area — explicit surface so body (:root) dark bg does not show through */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden min-w-0 bg-zinc-950">
        {/* Top bar */}
        <header className="relative z-40 h-14 bg-zinc-900/80 backdrop-blur border-b border-white/[0.06] flex items-center px-4 md:px-6 gap-3 shrink-0">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{currentNav?.label ?? "Admin"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-9H21M3 12h-.34m15.02 6.02l.71.71M5.63 5.63l.71.71m11.34 0l-.71.71M6.34 17.66l-.71.71M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
              )}
            </button>
            <NotificationBell />
            <Link
              href="/"
              target="_blank"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
              title="View public site"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-zinc-950">{children}</main>
      </div>
    </div>
    </AdminThemeProvider>
  );
}

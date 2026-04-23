"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("public-theme");
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      }
    } catch {
      // ignore local storage failures
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("public-theme", theme);
    } catch {
      // ignore local storage failures
    }
  }, [theme]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/floor-plan", label: "Floor Plan" },
    { href: "/payment-plan", label: "Payment Plan" },
    { href: "/verify-ownership", label: "Verify Ownership" },
  ];

  const headerLogoSrc = "/ONE%20CAPITAL%20NEW%20BLACK%20FONT.png";

  return (
    <div className="public-theme-root public-page min-h-screen bg-[var(--public-bg)]" data-public-theme={theme}>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? theme === "light"
              ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-lg shadow-slate-900/10"
              : "bg-black/95 backdrop-blur-xl border-b border-[#c9a227]/20 shadow-lg shadow-black/50"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-24">
          {/* Logo — One Capital Builders only */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src={headerLogoSrc}
              alt="One Capital Builders – Shops and Offices for Sale in Islamabad"
              width={240}
              height={88}
              className="h-20 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-[#c9a227]"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#c9a227] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition"
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
            <Link
              href="/verify-ownership"
              className="public-header-cta-gold px-3 py-2 text-sm font-semibold text-[#c9a227] border border-[#c9a227]/50 rounded-lg hover:bg-[#c9a227]/10 transition-all duration-200"
            >
              Verify Ownership
            </Link>
            <Link
              href="/floor-plan"
              className="public-blue-chip-active px-3 py-2 text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#3b82f6] rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/30"
            >
              View Floor Plan
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white transition"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </header>

      {/* ── Full-screen mobile drawer ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[70] w-72 bg-[var(--public-surface)] border-l border-white/10 flex flex-col md:hidden transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <Image
            src={headerLogoSrc}
            alt="One Capital Builders – Shops and Offices for Sale in Islamabad"
            width={120}
            height={44}
            className="h-10 w-auto"
          />
          <button
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 pt-4">
          <button
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition"
          >
            {theme === "light" ? "Switch to Dark" : "Switch to Light"}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "text-[#c9a227] bg-[#c9a227]/8 border border-[#c9a227]/20"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#c9a227] shrink-0" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA buttons */}
        <div className="px-4 pb-8 pt-4 border-t border-white/10 space-y-3">
          <Link
            href="/floor-plan"
            className="public-blue-chip-active flex items-center justify-center w-full py-3 text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#3b82f6] rounded-xl transition"
          >
            View Floor Plan
          </Link>
          <Link
            href="/verify-ownership"
            className="public-header-cta-gold flex items-center justify-center w-full py-3 text-sm font-semibold text-[#c9a227] border border-[#c9a227]/40 hover:bg-[#c9a227]/5 rounded-xl transition"
          >
            Verify Ownership
          </Link>
        </div>
      </div>

      <main>{children}</main>

      {/* ── Floating WhatsApp Inquiry Button ── */}
      <a
        href="https://api.whatsapp.com/send/?phone=923347444432&text=Hi+Team%2C+I%27m+interested+in+7Sky.+Please+share+details.&type=phone_number&app_absent=0"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Inquiry"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold pl-3.5 pr-5 py-3 rounded-full shadow-xl shadow-green-900/50 transition-all duration-200 hover:scale-105 group"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
        {/* WhatsApp icon */}
        <svg
          className="w-5 h-5 flex-shrink-0 relative"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="relative text-sm">WhatsApp</span>
      </a>
    </div>
  );
}

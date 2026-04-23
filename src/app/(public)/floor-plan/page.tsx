import { InteractiveFloorPlan } from "@/components/floor-plan/InteractiveFloorPlan";

export const metadata = {
  title: "Floor Plan – Shops & Offices for Sale in G-14 Markaz | 7Sky Islamabad",
  description: "View 7Sky interactive floor plan. Browse shops and offices for sale in G-14 Markaz Islamabad. Check real-time availability and book your commercial unit today.",
};

export default function FloorPlanPage() {
  return (
    <div className="public-page min-h-screen bg-[var(--public-bg)]">
      {/* Page header */}
      <div className="relative pt-28 pb-14 px-4 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2563eb]/5 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/30 to-transparent" />

        <div className="max-w-7xl mx-auto relative">
          <div className="section-label mb-4">Floor Plan</div>
          <div className="gold-divider mb-6" />
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--public-text)] mb-3">
                Floor Plan — Shops &amp; Offices for Sale
                <br />
                <span className="gradient-text-gold text-2xl sm:text-3xl">7Sky Commercial Plaza, G-14 Markaz Islamabad</span>
              </h1>
              <p className="text-[var(--public-text-muted)] text-base max-w-xl">
                Browse all 7 floors of shops and offices for sale in G-14 Markaz, Islamabad.
                Check real-time availability and request a booking directly. Available on easy installments.
              </p>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              {[
                { dot: "bg-emerald-500", label: "Available" },
                { dot: "bg-amber-500",   label: "Reserved" },
                { dot: "bg-red-500",     label: "Sold" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-[color:var(--public-border)] text-xs font-medium text-[var(--public-text-muted)]"
                >
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floor plan component */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <InteractiveFloorPlan />
      </div>
    </div>
  );
}

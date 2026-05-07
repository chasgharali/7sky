"use client";

import { useState, useEffect, useRef } from "react";

const FLOORS = [
  { id: "LGF", label: "Lower Ground", short: "LGF" },
  { id: "GF",  label: "Ground Floor", short: "GF" },
  { id: "1",   label: "1st Floor",    short: "1F" },
  { id: "2",   label: "2nd Floor",    short: "2F" },
  { id: "3",   label: "3rd Floor",    short: "3F" },
  { id: "4",   label: "4th Floor",    short: "4F" },
  { id: "5",   label: "5th Floor",    short: "5F" },
];

const FLOOR_IMAGE_FALLBACK: Record<string, string> = {
  LGF: "/media/floor-plans/lgf.png",
  GF: "/media/floor-plans/gf.png",
  "1": "/media/floor-plans/1f.png",
  "2": "/media/floor-plans/2f-3f.png",
  "3": "/media/floor-plans/3f.png",
  "4": "/media/floor-plans/4f.png",
  "5": "/media/floor-plans/5f.png",
};

// Scale multipliers against a 1100px base width
const ZOOM_LEVELS = [0.6, 0.8, 1, 1.25, 1.5, 2];
const FIT_ZOOM = -1; // sentinel for "fit" mode

interface Unit {
  _id: string;
  unitNumber: string;
  floor: string;
  type: string;
  size: number;
  price: number;
  status: "available" | "booked" | "reserved";
}

interface FloorPlanImage {
  floor: string;
  floorImageUrl?: string;
}

function UnitStatusBadge({ status }: { status: Unit["status"] }) {
  const map = {
    available: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    booked:    "bg-red-500/15 text-red-400 border-red-500/30",
    reserved:  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };
  return (
    <span className={`text-xs font-semibold capitalize px-2.5 py-0.5 rounded-full border ${map[status]}`}>
      {status === "booked" ? "Sold" : status}
    </span>
  );
}

export function InteractiveFloorPlan() {
  const [selectedFloor, setSelectedFloor] = useState("LGF");
  const [units, setUnits] = useState<Unit[]>([]);
  const [floorImageById, setFloorImageById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  // zoom index into ZOOM_LEVELS, or FIT_ZOOM for fit-to-width
  const [zoom, setZoom] = useState<number>(FIT_ZOOM);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Drag-to-pan state (using refs to avoid re-renders during drag)
  const viewerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, startX: 0, startY: 0, scrollL: 0, scrollT: 0 });

  const currentFloor = FLOORS.find((f) => f.id === selectedFloor)!;
  const currentFloorImage = floorImageById[selectedFloor] || FLOOR_IMAGE_FALLBACK[selectedFloor];
  const floorUnits = units.filter((u) => u.floor === selectedFloor);
  const filteredUnits = filterStatus === "all"
    ? floorUnits
    : floorUnits.filter((u) => u.status === filterStatus);

  const counts = {
    available: floorUnits.filter((u) => u.status === "available").length,
    booked:    floorUnits.filter((u) => u.status === "booked").length,
    reserved:  floorUnits.filter((u) => u.status === "reserved").length,
  };

  useEffect(() => {
    fetch("/api/units")
      .then((r) => r.json())
      .then((d) => setUnits(Array.isArray(d) ? d : []))
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/payment-plan")
      .then((r) => r.json())
      .then((d) => {
        if (!Array.isArray(d)) {
          setFloorImageById({});
          return;
        }
        const map = d.reduce<Record<string, string>>((acc, plan: FloorPlanImage) => {
          if (plan.floorImageUrl) acc[plan.floor] = plan.floorImageUrl;
          return acc;
        }, {});
        setFloorImageById(map);
      })
      .catch(() => setFloorImageById({}));
  }, []);

  const handleFloorChange = (id: string) => {
    if (id === selectedFloor) return;
    setSelectedFloor(id);
    setFilterStatus("all");
    setZoom(FIT_ZOOM);
    // Reset scroll position
    if (viewerRef.current) {
      viewerRef.current.scrollLeft = 0;
      viewerRef.current.scrollTop = 0;
    }
  };

  // --- Drag-to-pan via native pointer events (attached in useEffect) ---
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // left button only
      dragState.current = { active: true, startX: e.clientX, startY: e.clientY, scrollL: el.scrollLeft, scrollT: el.scrollTop };
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragState.current.active) return;
      e.preventDefault();
      el.scrollLeft = dragState.current.scrollL - (e.clientX - dragState.current.startX);
      el.scrollTop  = dragState.current.scrollT - (e.clientY - dragState.current.startY);
    };
    const onPointerUp = () => {
      dragState.current.active = false;
      el.style.cursor = "grab";
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointerleave", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointerleave", onPointerUp);
    };
  }, []);

  // --- Scroll-wheel zoom ---
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // only Ctrl+wheel
      e.preventDefault();
      setZoom((z) => {
        if (e.deltaY < 0) return z === FIT_ZOOM ? 2 : Math.min(ZOOM_LEVELS.length - 1, z + 1);
        return z === FIT_ZOOM || z === 0 ? FIT_ZOOM : z - 1;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const zoomLabel =
    zoom === FIT_ZOOM ? "Fit" : `${Math.round(ZOOM_LEVELS[zoom] * 100)}%`;

  const canZoomOut = zoom > 0;
  const canZoomIn  = zoom < ZOOM_LEVELS.length - 1;

  const handleZoomIn = () => setZoom((z) => (z === FIT_ZOOM ? 2 : Math.min(ZOOM_LEVELS.length - 1, z + 1)));
  const handleZoomOut = () => setZoom((z) => (z === FIT_ZOOM || z === 0 ? FIT_ZOOM : z - 1));
  const handleReset = () => {
    setZoom(FIT_ZOOM);
    if (viewerRef.current) { viewerRef.current.scrollLeft = 0; viewerRef.current.scrollTop = 0; }
  };

  // --- Booking ---
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;
    setBookingSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookingForm.name,
          phone: bookingForm.phone,
          email: bookingForm.email || undefined,
          unitId: selectedUnit._id,
          message: bookingForm.message || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          setSelectedUnit(null);
          setBookingForm({ name: "", phone: "", email: "", message: "" });
          setBookingSuccess(false);
        }, 2500);
      } else {
        alert(data.error || "Failed to submit. Please try again.");
      }
    } catch {
      alert("Failed to submit. Please try again.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const unitCardColor = {
    available:
      "bg-emerald-500/15 border-emerald-500/35 hover:bg-emerald-500/25 hover:border-emerald-400",
    booked: "bg-red-500/15 border-red-500/35 hover:bg-red-500/25",
    reserved:
      "bg-amber-500/15 border-amber-500/35 hover:bg-amber-500/25 hover:border-amber-400",
  };

  return (
    <div className="public-page space-y-6">
      {/* ─── Floor Selector ─── */}
      <div className="overflow-x-auto pt-2 pb-1">
        <div className="flex gap-2 min-w-max px-1">
          {FLOORS.map((f) => {
            const active = f.id === selectedFloor;
            const floorUnitsForTab = units.filter((u) => u.floor === f.id);
            const avail = floorUnitsForTab.filter((u) => u.status === "available").length;
            return (
              <button
                key={f.id}
                onClick={() => handleFloorChange(f.id)}
                className={`relative flex flex-col items-center px-5 py-3 rounded-xl font-medium transition-all duration-200 border ${
                  active
                    ? "public-blue-chip-active bg-[#2563eb] text-white border-blue-600 shadow-lg shadow-blue-900/40"
                    : "bg-[var(--public-muted)] text-[var(--public-text-muted)] border-[color:var(--public-border)] hover:bg-[var(--public-hover)] hover:text-[var(--public-text)]"
                }`}
              >
                <span className="text-xs font-black">{f.short}</span>
                <span className="text-[10px] mt-0.5 opacity-80">{f.label}</span>
                {avail > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 !text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {avail}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Main Grid ─── */}
      <div className="grid xl:grid-cols-3 gap-5 xl:h-[680px]">
        {/* Floor Plan Image Viewer */}
        <div className="xl:col-span-2 bg-[var(--public-surface)] rounded-2xl border border-[color:var(--public-border)] overflow-hidden flex flex-col shadow-sm">
          {/* Header with zoom controls */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--public-border)]">
            <div>
              <h3 className="font-semibold text-[var(--public-text)] text-sm">
                {currentFloor.label} – Floor Plan
              </h3>
              <p className="text-xs text-[var(--public-text-soft)] mt-0.5">
                {zoom === FIT_ZOOM
                  ? "Full view — zoom in to explore details"
                  : "Drag to pan · use controls to zoom"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[var(--public-bg)] rounded-lg border border-[color:var(--public-border)]">
                <button
                  onClick={handleZoomOut}
                  disabled={!canZoomOut && zoom === FIT_ZOOM}
                  className="px-3 py-1.5 text-[var(--public-text-muted)] hover:text-[var(--public-text)] disabled:opacity-30 transition text-base font-bold"
                  aria-label="Zoom out"
                >
                  −
                </button>
                <span className="px-3 py-1.5 text-xs font-mono text-[var(--public-text-muted)] border-x border-[color:var(--public-border)] min-w-[52px] text-center">
                  {zoomLabel}
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={!canZoomIn}
                  className="px-3 py-1.5 text-[var(--public-text-muted)] hover:text-[var(--public-text)] disabled:opacity-30 transition text-base font-bold"
                  aria-label="Zoom in"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs text-[var(--public-text-muted)] hover:text-[var(--public-text)] bg-[var(--public-bg)] border border-[color:var(--public-border)] rounded-lg transition"
              >
                Fit
              </button>
            </div>
          </div>

          {/* Scrollable image viewer — fills remaining height of the card */}
          <div
            ref={viewerRef}
            className="h-60 sm:h-80 xl:flex-1 overflow-auto bg-white"
            style={{
              cursor: zoom === FIT_ZOOM ? "default" : "grab",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            {/*
              Inner wrapper — its width drives the scroll area.
              When zoomed, it is wider than the outer div → scrollbars appear.
              Tailwind preflight sets max-width:100% on <img> globally,
              so we must override it with maxWidth:"none" when zoomed.
            */}
            <div
              style={
                zoom === FIT_ZOOM
                  ? { width: "100%" }
                  : { width: `${Math.round(ZOOM_LEVELS[zoom] * 1100)}px`, minWidth: `${Math.round(ZOOM_LEVELS[zoom] * 1100)}px` }
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={selectedFloor}
                src={currentFloorImage}
                alt={`${currentFloor.label} – Floor Plan`}
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  maxWidth: "none",   // override Tailwind preflight
                  pointerEvents: "none",
                }}
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Unit list panel — same height as the grid row, internal scroll */}
        <div className="bg-[var(--public-surface)] rounded-2xl border border-[color:var(--public-border)] overflow-hidden flex flex-col h-72 xl:h-full shadow-sm">
          <div className="px-5 py-4 border-b border-[color:var(--public-border)]">
            <h3 className="font-semibold text-[var(--public-text)] text-sm mb-3">
              Units – {currentFloor.label}
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { key: "available", label: "Available", count: counts.available, dot: "bg-emerald-500" },
                { key: "booked",    label: "Sold",      count: counts.booked,    dot: "bg-red-500" },
                { key: "reserved",  label: "Reserved",  count: counts.reserved,  dot: "bg-amber-500" },
              ].map((s) => (
                <div key={s.key} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className="text-xs text-[var(--public-text-muted)]">{s.label}</span>
                  {!loading && (
                    <span className="text-xs font-bold text-[var(--public-text)]">({s.count})</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              {["all", "available", "booked", "reserved"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition capitalize border border-transparent ${
                    filterStatus === f
                      ? "public-blue-chip-active bg-[#2563eb] text-white"
                      : "bg-[var(--public-muted)] text-[var(--public-text-muted)] border-[color:var(--public-border)] hover:bg-[var(--public-hover)] hover:text-[var(--public-text)]"
                  }`}
                >
                  {f === "booked" ? "sold" : f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 bg-[var(--public-muted)] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg
                  className="w-10 h-10 text-[var(--public-text-soft)] mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-[var(--public-text-muted)] text-sm">No units found</p>
                <p className="text-[var(--public-text-soft)] text-xs mt-1">
                  {filterStatus !== "all" ? "Try changing the filter" : "No units loaded yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredUnits.map((unit) => (
                  <button
                    key={unit._id}
                    onClick={() => setSelectedUnit(unit)}
                    className={`p-3 rounded-xl text-left border transition-all duration-200 ${unitCardColor[unit.status]}`}
                  >
                    <p className="font-bold text-[var(--public-text)] text-sm">{unit.unitNumber}</p>
                    <p className="text-xs text-[var(--public-text-muted)] capitalize">{unit.type}</p>
                    <p className="text-xs text-[var(--public-text-soft)] mt-1 font-medium">
                      Rs. {(unit.price / 1000000).toFixed(1)}M
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Unit Detail Modal ─── */}
      {selectedUnit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedUnit(null); }}
        >
          <div className="bg-[var(--public-surface)] rounded-2xl border border-[color:var(--public-border)] max-w-md w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--public-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563eb]/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-[var(--public-text)]">Unit {selectedUnit.unitNumber}</p>
                  <UnitStatusBadge status={selectedUnit.status} />
                </div>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="p-2 text-[var(--public-text-soft)] hover:text-[var(--public-text)] rounded-lg hover:bg-[var(--public-hover)] transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-3">
              {[
                { label: "Floor", value: FLOORS.find((f) => f.id === selectedUnit.floor)?.label ?? selectedUnit.floor },
                { label: "Type", value: selectedUnit.type, capitalize: true },
                { label: "Size", value: `${selectedUnit.size} sqft` },
                { label: "Price", value: `Rs. ${selectedUnit.price.toLocaleString()}`, accent: true },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-[color:var(--public-border)]">
                  <span className="text-sm text-[var(--public-text-soft)]">{row.label}</span>
                  <span
                    className={`text-sm ${row.capitalize ? "capitalize" : ""} ${row.accent ? "text-[#c9a227] font-bold" : "text-[var(--public-text)]"}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6">
              {selectedUnit.status === "booked" ? (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-400">This unit has already been sold.</p>
                </div>
              ) : bookingSuccess ? (
                <div className="flex flex-col items-center gap-2 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-emerald-400 font-semibold text-sm">Booking request submitted!</p>
                  <p className="text-[var(--public-text-soft)] text-xs">Our team will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-3">
                  <p className="text-sm font-semibold text-[var(--public-text)] mb-3">Request a Booking</p>
                  <input type="text" placeholder="Full Name *" required value={bookingForm.name}
                    onChange={(e) => setBookingForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[var(--public-bg)] border border-[color:var(--public-border)] rounded-xl text-[var(--public-text)] placeholder:text-[var(--public-text-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]" />
                  <input type="tel" placeholder="Phone Number *" required value={bookingForm.phone}
                    onChange={(e) => setBookingForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[var(--public-bg)] border border-[color:var(--public-border)] rounded-xl text-[var(--public-text)] placeholder:text-[var(--public-text-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]" />
                  <input type="email" placeholder="Email (optional)" value={bookingForm.email}
                    onChange={(e) => setBookingForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[var(--public-bg)] border border-[color:var(--public-border)] rounded-xl text-[var(--public-text)] placeholder:text-[var(--public-text-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]" />
                  <textarea placeholder="Message (optional)" value={bookingForm.message}
                    onChange={(e) => setBookingForm((p) => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[var(--public-bg)] border border-[color:var(--public-border)] rounded-xl text-[var(--public-text)] placeholder:text-[var(--public-text-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] resize-none"
                    rows={2} />
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={bookingSubmitting}
                      className="public-blue-chip-active flex-1 py-2.5 bg-[#2563eb] hover:bg-[#3b82f6] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition">
                      {bookingSubmitting ? "Submitting…" : "Submit Request"}
                    </button>
                    <button type="button" onClick={() => setSelectedUnit(null)}
                      className="px-4 py-2.5 border border-[color:var(--public-border)] text-[var(--public-text-muted)] hover:text-[var(--public-text)] rounded-xl text-sm transition hover:bg-[var(--public-hover)]">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

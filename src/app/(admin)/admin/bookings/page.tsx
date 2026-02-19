"use client";

import { useEffect, useState } from "react";

interface Booking {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: "pending" | "approved" | "rejected" | "reserved";
  createdAt: string;
  unitId: { unitNumber: string; floor: string; price: number } | null;
}

type FilterTab = "all" | "pending" | "approved" | "rejected" | "reserved";

function statusBadge(s: string) {
  if (s === "pending") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (s === "approved") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (s === "reserved") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function loadBookings() {
    setLoading(true);
    const data = await fetch("/api/admin/bookings", { credentials: "include" })
      .then((r) => r.json()).catch(() => []);
    setBookings(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadBookings(); }, []);

  async function updateStatus(id: string, status: "approved" | "rejected" | "reserved" | "pending") {
    setUpdating(id);
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      credentials: "include",
    });
    if (res.ok) {
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)));
      if (selected?._id === id) setSelected((s) => s ? { ...s, status } : null);
    }
    setUpdating(null);
  }

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    reserved: bookings.filter((b) => b.status === "reserved").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };

  const filtered = bookings.filter((b) => {
    const matchFilter = filter === "all" || b.status === filter;
    const matchSearch = !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search) ||
      (b.unitId?.unitNumber || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const tabs: { key: FilterTab; label: string; color: string }[] = [
    { key: "all", label: "All", color: "text-zinc-400" },
    { key: "pending", label: "Pending", color: "text-amber-400" },
    { key: "approved", label: "Approved", color: "text-emerald-400" },
    { key: "reserved", label: "Reserved", color: "text-blue-400" },
    { key: "rejected", label: "Rejected", color: "text-red-400" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Booking Requests</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {counts.pending > 0 ? (
              <span className="text-amber-400 font-semibold">{counts.pending} pending review</span>
            ) : (
              `${bookings.length} total requests`
            )}
          </p>
        </div>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-zinc-900 border border-white/[0.06] rounded-xl p-1 gap-0.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === t.key ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                filter === t.key ? "bg-zinc-700 text-white" : "bg-zinc-800/60"
              } ${t.color}`}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>
        <input
          type="text" placeholder="Search by name, phone or unit…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-zinc-800 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-zinc-500 font-medium">No booking requests found</p>
          <p className="text-zinc-600 text-sm mt-1">
            {filter !== "all" ? "Try a different filter" : "No requests submitted yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => (
            <div
              key={b._id}
              onClick={() => setSelected(b)}
              className={`bg-zinc-900 border rounded-2xl px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-zinc-800/60 transition group ${
                b.status === "pending" ? "border-amber-500/20" : "border-white/[0.06]"
              }`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                b.status === "pending" ? "bg-amber-500/20 text-amber-400"
                : b.status === "approved" ? "bg-emerald-500/20 text-emerald-400"
                : b.status === "reserved" ? "bg-blue-500/20 text-blue-400"
                : "bg-red-500/20 text-red-400"
              }`}>
                {b.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-semibold">{b.name}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${statusBadge(b.status)}`}>
                    {b.status}
                  </span>
                  {b.unitId && (
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs border border-white/10">
                      {b.unitId.unitNumber}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <p className="text-zinc-400 text-sm">{b.phone}</p>
                  {b.email && <p className="text-zinc-500 text-sm">{b.email}</p>}
                  {b.message && (
                    <p className="text-zinc-600 text-xs truncate max-w-[200px]">"{b.message}"</p>
                  )}
                </div>
              </div>

              {/* Time + actions */}
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-zinc-600 text-xs">{timeAgo(b.createdAt)}</p>
                {b.status !== "rejected" && (
                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {b.status === "pending" && (
                      <button
                        onClick={() => updateStatus(b._id, "approved")}
                        disabled={updating === b._id}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-xs font-semibold rounded-xl transition disabled:opacity-50"
                      >
                        {updating === b._id ? "…" : "Approve"}
                      </button>
                    )}
                    {b.status !== "reserved" && (
                      <button
                        onClick={() => updateStatus(b._id, "reserved")}
                        disabled={updating === b._id}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-semibold rounded-xl transition disabled:opacity-50"
                      >
                        {updating === b._id ? "…" : "Reserve"}
                      </button>
                    )}
                    {b.status === "reserved" && (
                      <button
                        onClick={() => updateStatus(b._id, "pending")}
                        disabled={updating === b._id}
                        className="px-3 py-1.5 bg-zinc-700/60 hover:bg-zinc-600/60 text-zinc-300 text-xs font-semibold rounded-xl transition disabled:opacity-50"
                      >
                        {updating === b._id ? "…" : "Unreserve"}
                      </button>
                    )}
                    {b.status === "pending" && (
                      <button
                        onClick={() => updateStatus(b._id, "rejected")}
                        disabled={updating === b._id}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-semibold rounded-xl transition disabled:opacity-50"
                      >
                        {updating === b._id ? "…" : "Reject"}
                      </button>
                    )}
                  </div>
                )}
                <svg className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-end p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm h-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-white font-bold">Request Details</h2>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-sm">Status</span>
                <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-lg border ${statusBadge(selected.status)}`}>
                  {selected.status}
                </span>
              </div>

              {/* Contact */}
              <div className="bg-zinc-800/60 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Requester</p>
                <div>
                  <p className="text-white font-bold text-lg">{selected.name}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <a href={`tel:${selected.phone}`} className="text-blue-400 hover:underline">{selected.phone}</a>
                </div>
                {selected.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <a href={`mailto:${selected.email}`} className="text-blue-400 hover:underline">{selected.email}</a>
                  </div>
                )}
              </div>

              {/* Unit */}
              {selected.unitId && (
                <div className="bg-zinc-800/60 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Requested Unit</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
                    </div>
                    <div>
                      <p className="text-white font-bold">{selected.unitId.unitNumber}</p>
                      <p className="text-zinc-400 text-xs">Floor {selected.unitId.floor} · Rs. {selected.unitId.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {selected.message && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Message</p>
                  <p className="text-zinc-300 text-sm bg-zinc-800/60 rounded-xl p-4 leading-relaxed">{selected.message}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-zinc-600 space-y-1">
                <p>Submitted: {new Date(selected.createdAt).toLocaleString()}</p>
                <p>ID: {selected._id}</p>
              </div>
            </div>

            {/* Actions */}
            {selected.status !== "rejected" && (
              <div className="px-6 py-4 border-t border-white/[0.06] flex gap-2">
                {selected.status === "pending" && (
                  <button
                    onClick={() => updateStatus(selected._id, "approved")}
                    disabled={updating === selected._id}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition"
                  >
                    {updating === selected._id ? "Updating…" : "Approve"}
                  </button>
                )}
                {selected.status !== "reserved" && (
                  <button
                    onClick={() => updateStatus(selected._id, "reserved")}
                    disabled={updating === selected._id}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition"
                  >
                    {updating === selected._id ? "Updating…" : "Mark Reserved"}
                  </button>
                )}
                {selected.status === "reserved" && (
                  <button
                    onClick={() => updateStatus(selected._id, "pending")}
                    disabled={updating === selected._id}
                    className="flex-1 py-2.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition"
                  >
                    {updating === selected._id ? "Updating…" : "Unreserve"}
                  </button>
                )}
                {selected.status === "pending" && (
                  <button
                    onClick={() => updateStatus(selected._id, "rejected")}
                    disabled={updating === selected._id}
                    className="flex-1 py-2.5 bg-red-600/30 hover:bg-red-600/50 disabled:opacity-50 text-red-400 text-sm font-bold rounded-xl transition"
                  >
                    {updating === selected._id ? "Updating…" : "Reject"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

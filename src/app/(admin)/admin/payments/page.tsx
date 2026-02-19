"use client";

import { useEffect, useRef, useState } from "react";

interface Payment {
  _id: string;
  amount: number;
  date: string;
  paymentMethod: string;
  receiptNumber?: string;
  notes?: string;
  ownerId: { _id: string; ownerName: string; registrationNumber: string } | null;
}

interface Owner {
  _id: string;
  ownerName: string;
  registrationNumber: string;
}

const METHODS = ["Cash", "Bank Transfer", "Cheque", "Online"];

const EMPTY_FORM = {
  ownerId: "", amount: "", date: new Date().toISOString().split("T")[0],
  paymentMethod: "Cash", receiptNumber: "", notes: "",
};

function formatPKR(n: number) {
  if (n >= 10000000) return `Rs. ${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `Rs. ${(n / 100000).toFixed(1)}L`;
  return `Rs. ${n.toLocaleString()}`;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Owner combobox state
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false);
  const ownerComboRef = useRef<HTMLDivElement>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadPayments() {
    setLoading(true);
    const data = await fetch("/api/admin/payments", { credentials: "include" })
      .then((r) => r.json()).catch(() => []);
    setPayments(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadPayments();
    fetch("/api/admin/owners", { credentials: "include" })
      .then((r) => r.json()).then((d) => setOwners(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    const body = { ...form, amount: Number(form.amount) };
    const res = await fetch("/api/admin/payments", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to save"); setSaving(false); return; }
    setModalOpen(false);
    setForm(EMPTY_FORM);
    loadPayments();
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/admin/payments/${deleteId}`, { method: "DELETE", credentials: "include" });
    setDeleteId(null);
    setDeleting(false);
    loadPayments();
  }

  // Close owner dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ownerComboRef.current && !ownerComboRef.current.contains(e.target as Node)) {
        setOwnerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOwner = owners.find((o) => o._id === form.ownerId);
  const filteredOwners = owners.filter((o) =>
    !ownerSearch ||
    o.ownerName.toLowerCase().includes(ownerSearch.toLowerCase()) ||
    o.registrationNumber.toLowerCase().includes(ownerSearch.toLowerCase())
  ).slice(0, 10);

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const filtered = payments.filter((p) =>
    !search ||
    (p.ownerId?.ownerName || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.ownerId?.registrationNumber || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.receiptNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Payments</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{payments.length} records · {formatPKR(total)} collected</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            const csv = ["Date,Owner,Registration,Amount,Method,Receipt",
              ...payments.map((p) => `${p.date?.split("T")[0]||""},${p.ownerId?.ownerName||""},${p.ownerId?.registrationNumber||""},${p.amount},${p.paymentMethod},${p.receiptNumber||""}`)
            ].join("\n");
            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
            a.download = "payments.csv"; a.click();
          }} className="px-3 py-2 text-xs bg-zinc-800 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition">
            Export CSV
          </button>
          <button onClick={() => { setForm(EMPTY_FORM); setError(""); setOwnerSearch(""); setOwnerDropdownOpen(false); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Record Payment
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text" placeholder="Search by owner or receipt…" value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
      />

      {/* Table / Cards */}
      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-zinc-800 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-white/[0.06] rounded-2xl px-5 py-10 text-center text-zinc-600">No payments found</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {filtered.map((p) => (
              <div key={p._id} className="bg-zinc-900 border border-white/[0.06] rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{p.ownerId?.ownerName || "—"}</p>
                    <p className="text-zinc-500 text-xs font-mono mt-0.5">{p.ownerId?.registrationNumber}</p>
                  </div>
                  <p className="text-emerald-400 font-bold text-base shrink-0">{formatPKR(p.amount)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-800/60 rounded-xl p-2.5">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Date</p>
                    <p className="text-xs font-semibold text-zinc-300 mt-0.5">{p.date?.split("T")[0] || "—"}</p>
                  </div>
                  <div className="bg-zinc-800/60 rounded-xl p-2.5">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Method</p>
                    <p className="text-xs font-semibold text-purple-400 mt-0.5 capitalize">{p.paymentMethod}</p>
                  </div>
                </div>
                {(p.receiptNumber || p.notes) && (
                  <div className="text-xs text-zinc-500 bg-zinc-800/40 rounded-xl px-3 py-2 space-y-0.5">
                    {p.receiptNumber && <p>Receipt: <span className="text-zinc-400 font-mono">{p.receiptNumber}</span></p>}
                    {p.notes && <p className="truncate">Notes: {p.notes}</p>}
                  </div>
                )}
                <button onClick={() => setDeleteId(p._id)} className="w-full py-1.5 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition">Delete</button>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-zinc-900 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="text-left border-b border-white/[0.06]">
                    {["Date", "Owner", "Amount", "Method", "Receipt", "Notes", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-zinc-400 text-xs whitespace-nowrap">{p.date?.split("T")[0] || "—"}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div>
                          <p className="text-white font-medium">{p.ownerId?.ownerName || "—"}</p>
                          <p className="text-zinc-500 text-xs font-mono">{p.ownerId?.registrationNumber}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-emerald-400 font-bold whitespace-nowrap">{formatPKR(p.amount)}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs">{p.paymentMethod}</span>
                      </td>
                      <td className="px-5 py-3 text-zinc-400 text-xs font-mono whitespace-nowrap">{p.receiptNumber || "—"}</td>
                      <td className="px-5 py-3 text-zinc-500 text-xs max-w-[120px] truncate">{p.notes || "—"}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => setDeleteId(p._id)} className="px-3 py-1 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Payment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-white font-bold">Record Payment</h2>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {error && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
              {/* Owner live-search combobox */}
              <div ref={ownerComboRef}>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Owner *</label>
                <div className="relative">
                  <div className="flex items-center gap-1 w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-xl focus-within:ring-1 focus-within:ring-blue-600">
                    <svg className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" /></svg>
                    <input
                      type="text"
                      placeholder="Search owner by name or reg. no…"
                      value={selectedOwner && !ownerDropdownOpen ? `${selectedOwner.ownerName} (${selectedOwner.registrationNumber})` : ownerSearch}
                      onFocus={() => { setOwnerDropdownOpen(true); setOwnerSearch(""); }}
                      onChange={(e) => { setOwnerSearch(e.target.value); setOwnerDropdownOpen(true); }}
                      className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 focus:outline-none min-w-0"
                    />
                    {form.ownerId && (
                      <button type="button" onClick={() => { setForm((f) => ({ ...f, ownerId: "" })); setOwnerSearch(""); setOwnerDropdownOpen(false); }}
                        className="text-zinc-500 hover:text-white transition flex-shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                  {ownerDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-zinc-800 border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {filteredOwners.length === 0 ? (
                        <div className="px-3 py-3 text-zinc-500 text-xs text-center">No owners found</div>
                      ) : filteredOwners.map((o) => (
                        <button key={o._id} type="button"
                          onMouseDown={() => { setForm((f) => ({ ...f, ownerId: o._id })); setOwnerSearch(""); setOwnerDropdownOpen(false); }}
                          className="w-full text-left px-3 py-2 hover:bg-zinc-700 transition flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {o.ownerName.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{o.ownerName}</p>
                            <p className="text-zinc-500 text-xs font-mono">{o.registrationNumber}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {[
                { label: "Amount (Rs.) *", key: "amount", type: "number", placeholder: "e.g. 500000" },
                { label: "Date *", key: "date", type: "date", placeholder: "" },
                { label: "Receipt Number", key: "receiptNumber", type: "text", placeholder: "e.g. RCT-001" },
                { label: "Notes", key: "notes", type: "text", placeholder: "Optional note" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{label}</label>
                  <input
                    type={type} placeholder={placeholder} value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Payment Method *</label>
                <select value={form.paymentMethod} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-600">
                  {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/[0.06] flex gap-2 justify-end">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition">
                {saving ? "Saving…" : "Record"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-white font-bold mb-1">Delete Payment?</h3>
            <p className="text-zinc-500 text-sm mb-5">This will reverse the owner&apos;s amount paid balance.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white bg-zinc-800 rounded-xl transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition">
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface Unit {
  _id: string;
  unitNumber: string;
  floor: string;
  type: string;
  size: number;
  price: number;
  status: string;
}

const FLOORS = ["LGF", "GF", "1", "2", "3", "4", "5"];
const TYPES = ["shop", "office"];
const STATUSES = ["available", "booked", "reserved"];

const EMPTY_FORM = { unitNumber: "", floor: "LGF", type: "shop", size: "", price: "", status: "available" };

function statusStyle(s: string) {
  if (s === "available") return "bg-emerald-500/20 text-emerald-400";
  if (s === "booked") return "bg-red-500/20 text-red-400";
  return "bg-amber-500/20 text-amber-400";
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterFloor, setFilterFloor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadUnits() {
    setLoading(true);
    const data = await fetch("/api/admin/units", { credentials: "include" })
      .then((r) => r.json()).catch(() => []);
    setUnits(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadUnits(); }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(u: Unit) {
    setEditing(u);
    setForm({ unitNumber: u.unitNumber, floor: u.floor, type: u.type, size: String(u.size), price: String(u.price), status: u.status });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const body = { ...form, size: Number(form.size), price: Number(form.price) };
    const url = editing ? `/api/admin/units/${editing._id}` : "/api/admin/units";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method, credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to save"); setSaving(false); return; }
    setModalOpen(false);
    loadUnits();
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/admin/units/${deleteId}`, { method: "DELETE", credentials: "include" });
    setDeleteId(null);
    setDeleting(false);
    loadUnits();
  }

  const filtered = units.filter((u) => {
    const matchSearch = !search || u.unitNumber.toLowerCase().includes(search.toLowerCase());
    const matchFloor = filterFloor === "all" || u.floor === filterFloor;
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    return matchSearch && matchFloor && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Units</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{units.length} total units</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            const csv = ["Unit,Floor,Type,Size,Price,Status",
              ...units.map((u) => `${u.unitNumber},${u.floor},${u.type},${u.size},${u.price},${u.status}`)
            ].join("\n");
            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
            a.download = "units.csv"; a.click();
          }} className="px-3 py-2 text-xs bg-zinc-800 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition">
            Export CSV
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Unit
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text" placeholder="Search unit…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
        <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)}
          className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-600">
          <option value="all">All Floors</option>
          {FLOORS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-600">
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-zinc-800 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-white/[0.06] rounded-2xl px-5 py-10 text-center text-zinc-600">No units found</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {filtered.map((u) => (
              <div key={u._id} className="bg-zinc-900 border border-white/[0.06] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold font-mono text-base">{u.unitNumber}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{u.floor} · <span className="capitalize">{u.type}</span></p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusStyle(u.status)}`}>{u.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-800/60 rounded-xl p-2.5">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Size</p>
                    <p className="text-sm font-semibold text-zinc-300 mt-0.5">{u.size.toLocaleString()} sqft</p>
                  </div>
                  <div className="bg-zinc-800/60 rounded-xl p-2.5">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Price</p>
                    <p className="text-sm font-semibold text-zinc-300 mt-0.5">Rs. {u.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(u)} className="flex-1 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition">Edit</button>
                  <button onClick={() => setDeleteId(u._id)} className="flex-1 py-1.5 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition">Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-zinc-900 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="text-left border-b border-white/[0.06]">
                    {["Unit", "Floor", "Type", "Size", "Price", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-white font-mono font-bold whitespace-nowrap">{u.unitNumber}</td>
                      <td className="px-5 py-3 text-zinc-400 whitespace-nowrap">{u.floor}</td>
                      <td className="px-5 py-3 text-zinc-400 capitalize whitespace-nowrap">{u.type}</td>
                      <td className="px-5 py-3 text-zinc-400 whitespace-nowrap">{u.size.toLocaleString()} sqft</td>
                      <td className="px-5 py-3 text-zinc-300 whitespace-nowrap">Rs. {u.price.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyle(u.status)}`}>{u.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(u)} className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition">Edit</button>
                          <button onClick={() => setDeleteId(u._id)} className="px-3 py-1 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-white font-bold">{editing ? "Edit Unit" : "Add Unit"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {error && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
              {[
                { label: "Unit Number", key: "unitNumber", type: "text", placeholder: "e.g. LGF-01" },
                { label: "Size (sqft)", key: "size", type: "number", placeholder: "e.g. 150" },
                { label: "Price (Rs.)", key: "price", type: "number", placeholder: "e.g. 5000000" },
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
              {[
                { label: "Floor", key: "floor", opts: FLOORS },
                { label: "Type", key: "type", opts: TYPES },
                { label: "Status", key: "status", opts: STATUSES },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{label}</label>
                  <select value={form[key as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-600">
                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-white/[0.06] flex gap-2 justify-end">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition">
                {saving ? "Saving…" : "Save"}
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
            <h3 className="text-white font-bold mb-1">Delete Unit?</h3>
            <p className="text-zinc-500 text-sm mb-5">This action cannot be undone.</p>
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

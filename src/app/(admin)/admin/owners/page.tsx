"use client";

import { useEffect, useState } from "react";
import { findPlanRow } from "@/lib/findPlanRow";

interface TransferRecord {
  previousOwnerName: string;
  previousCnic: string;
  previousPhone: string;
  transferNote: string;
  transferredAt: string;
}

interface Owner {
  _id: string;
  registrationNumber: string;
  ownerName: string;
  cnic: string;
  phone?: string;
  residentOf?: string;
  photoUrl?: string;
  photoPublicId?: string;
  verificationToken: string;
  unitId: { _id: string; unitNumber: string; floor: string } | null;
  totalAmount: number;
  discount: number;
  amountPaid: number;
  pendingAmount: number;
  nextDue: string | null;
  transferHistory?: TransferRecord[];
}

interface Unit {
  _id: string;
  unitNumber: string;
  floor: string;
  price?: number;
  status?: string;
}

interface PlanRow { shopNo: string; unitPrice: number; downpayment: number; }
interface PlanFloor { floor: string; rows: PlanRow[]; }

interface OwnerPayment {
  _id: string;
  amount: number;
  date: string;
  paymentMethod: string;
  receiptNumber?: string;
  notes?: string;
}

interface InstallmentItem {
  label: string;
  dueDate: string;
  amount: number;
  status: "paid" | "overdue" | "upcoming";
}

interface OwnerSchedule {
  ownerName: string;
  unitNumber: string;
  unitFloor?: string;
  totalAmount: number;
  amountPaid: number;
  pendingAmount: number;
  planFound: boolean;
  installmentSchedule: InstallmentItem[];
  paidCount: number;
  overdueCount: number;
  upcomingCount: number;
}

const EMPTY_FORM = {
  ownerName: "", cnic: "", phone: "", residentOf: "", unitId: "", totalAmount: "", amountPaid: "", discount: "",
};

const EMPTY_TRANSFER = { ownerName: "", cnic: "", phone: "", residentOf: "", transferNote: "" };

function formatPKR(n: number) {
  if (n >= 10000000) return `Rs. ${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `Rs. ${(n / 100000).toFixed(1)}L`;
  return `Rs. ${n.toLocaleString()}`;
}

function statusChip(s: "paid" | "overdue" | "upcoming") {
  if (s === "paid") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (s === "overdue") return "bg-red-500/20 text-red-400 border-red-500/30";
  return "bg-amber-500/20 text-amber-400 border-amber-500/30";
}

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [plans, setPlans] = useState<PlanFloor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Owner | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [listPrice, setListPrice] = useState(0);
  const [planDownpayment, setPlanDownpayment] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoUploadingId, setPhotoUploadingId] = useState<string | null>(null);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Transfer modal
  const [transferOwner, setTransferOwner] = useState<Owner | null>(null);
  const [transferForm, setTransferForm] = useState(EMPTY_TRANSFER);
  const [transferSaving, setTransferSaving] = useState(false);
  const [transferError, setTransferError] = useState("");

  // History modal
  const [historyOwner, setHistoryOwner] = useState<Owner | null>(null);

  // Payments modal
  const [paymentsOwner, setPaymentsOwner] = useState<Owner | null>(null);
  const [ownerPayments, setOwnerPayments] = useState<OwnerPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Schedule modal
  const [scheduleOwner, setScheduleOwner] = useState<Owner | null>(null);
  const [ownerSchedule, setOwnerSchedule] = useState<OwnerSchedule | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  async function loadOwners() {
    setLoading(true);
    const data = await fetch("/api/admin/owners", { credentials: "include" })
      .then((r) => r.json()).catch(() => []);
    setOwners(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadOwners();
    fetch("/api/admin/units", { credentials: "include" })
      .then((r) => r.json()).then((d) => setUnits(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/admin/payment-plan", { credentials: "include" })
      .then((r) => r.json()).then((d) => setPlans(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  function handleUnitChange(unitId: string) {
    const unit = units.find((u) => u._id === unitId);
    if (!unit) {
      setListPrice(0);
      setPlanDownpayment(null);
      setForm((f) => ({ ...f, unitId, totalAmount: "", discount: "" }));
      return;
    }
    const plan = plans.find((p) => p.floor === unit.floor);
    const row = plan ? findPlanRow(plan.rows, unit.unitNumber) : undefined;
    const price = row?.unitPrice ?? unit.price ?? 0;
    setListPrice(price);
    setPlanDownpayment(row?.downpayment ?? null);
    setForm((f) => ({ ...f, unitId, totalAmount: price > 0 ? String(price) : "", discount: "" }));
  }

  function handleDiscountChange(val: string) {
    const disc = Number(val) || 0;
    setForm((f) => ({
      ...f,
      discount: val,
      totalAmount: listPrice > 0 ? String(Math.max(0, listPrice - disc)) : f.totalAmount,
    }));
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setListPrice(0);
    setPlanDownpayment(null);
    setError("");
    setModalOpen(true);
  }

  function openEdit(o: Owner) {
    setEditing(o);
    setForm({
      ownerName: o.ownerName, cnic: o.cnic, phone: o.phone || "", residentOf: o.residentOf || "",
      unitId: o.unitId?._id || "", totalAmount: String(o.totalAmount),
      amountPaid: String(o.amountPaid), discount: String(o.discount || 0),
    });
    setListPrice(0);
    setPlanDownpayment(null);
    setError("");
    setModalOpen(true);
  }

  function openTransfer(o: Owner) {
    setTransferOwner(o);
    setTransferForm(EMPTY_TRANSFER);
    setTransferError("");
  }

  async function openPayments(o: Owner) {
    setPaymentsOwner(o);
    setOwnerPayments([]);
    setPaymentsLoading(true);
    const data = await fetch(`/api/admin/payments?ownerId=${o._id}`, { credentials: "include" })
      .then((r) => r.json()).catch(() => []);
    setOwnerPayments(Array.isArray(data) ? data : []);
    setPaymentsLoading(false);
  }

  async function openSchedule(o: Owner) {
    setScheduleOwner(o);
    setOwnerSchedule(null);
    setScheduleLoading(true);
    const data = await fetch(`/api/admin/owners/${o._id}/installments`, { credentials: "include" })
      .then((r) => r.json()).catch(() => null);
    setOwnerSchedule(data && !data.error ? data : null);
    setScheduleLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const body = {
      ownerName: form.ownerName,
      cnic: form.cnic,
      phone: form.phone,
      residentOf: form.residentOf,
      unitId: form.unitId,
      totalAmount: Number(form.totalAmount),
      amountPaid: Number(form.amountPaid),
      discount: Number(form.discount) || 0,
    };
    const url = editing ? `/api/admin/owners/${editing._id}` : "/api/admin/owners";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method, credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to save"); setSaving(false); return; }
    setModalOpen(false);
    loadOwners();
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/admin/owners/${deleteId}`, { method: "DELETE", credentials: "include" });
    setDeleteId(null);
    setDeleting(false);
    loadOwners();
  }

  async function handleTransfer() {
    if (!transferOwner) return;
    if (!transferForm.ownerName.trim() || !transferForm.cnic.trim()) {
      setTransferError("New owner name and CNIC are required.");
      return;
    }
    setTransferSaving(true);
    setTransferError("");
    const body = {
      ownerName: transferForm.ownerName,
      cnic: transferForm.cnic,
      phone: transferForm.phone,
      residentOf: transferForm.residentOf,
      transferNote: transferForm.transferNote || "Ownership transferred",
    };
    const res = await fetch(`/api/admin/owners/${transferOwner._id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setTransferError(data.error || "Transfer failed"); setTransferSaving(false); return; }
    if (data?._id) {
      window.open(`/api/admin/owners/${data._id}/letter?type=transfer`, "_blank");
    }
    setTransferOwner(null);
    loadOwners();
    setTransferSaving(false);
  }

  async function handlePhotoUpload(ownerId: string, file: File) {
    setPhotoUploadingId(ownerId);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/admin/owners/${ownerId}/photo`, {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "Photo upload failed");
    } else {
      loadOwners();
    }
    setPhotoUploadingId(null);
  }

  const filtered = owners.filter((o) =>
    !search ||
    o.ownerName.toLowerCase().includes(search.toLowerCase()) ||
    o.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
    (o.unitId?.unitNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Owners</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{owners.length} registered owners</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            const csv = ["Reg#,Name,CNIC,Phone,Unit,Discount,Total,Paid,Pending",
              ...owners.map((o) => `${o.registrationNumber},${o.ownerName},${o.cnic},${o.phone||""},${o.unitId?.unitNumber||""},${o.discount||0},${o.totalAmount},${o.amountPaid},${o.pendingAmount}`)
            ].join("\n");
            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
            a.download = "owners.csv"; a.click();
          }} className="px-3 py-2 text-xs bg-zinc-800 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition">
            Export CSV
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Add Owner
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text" placeholder="Search by name, registration or unit…" value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
      />

      {/* Table / Cards */}
      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-zinc-800 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-white/[0.06] rounded-2xl px-5 py-10 text-center text-zinc-600">No owners found</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {filtered.map((o) => {
              const pct = o.totalAmount > 0 ? Math.round((o.amountPaid / o.totalAmount) * 100) : 0;
              const isOverdue = o.nextDue && new Date(o.nextDue) < new Date();
              return (
                <div key={o._id} className="bg-zinc-900 border border-white/[0.06] rounded-2xl p-4 space-y-3">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600/20 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">
                        {o.ownerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm leading-tight">{o.ownerName}</p>
                        <p className="text-zinc-500 text-xs font-mono mt-0.5">{o.registrationNumber}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs border border-white/10 shrink-0">
                      {o.unitId?.unitNumber || "—"}
                    </span>
                  </div>
                  {/* Payment bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-400">{formatPKR(o.amountPaid)} paid</span>
                      <span className="text-zinc-500">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-zinc-800/60 rounded-xl p-2">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Total</p>
                      <p className="text-xs font-semibold text-zinc-300 mt-0.5">{formatPKR(o.totalAmount)}</p>
                    </div>
                    {o.discount > 0 && (
                      <div className="bg-zinc-800/60 rounded-xl p-2">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Discount</p>
                        <p className="text-xs font-semibold text-purple-400 mt-0.5">{formatPKR(o.discount)}</p>
                      </div>
                    )}
                    <div className="bg-zinc-800/60 rounded-xl p-2">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Pending</p>
                      <p className="text-xs font-semibold text-amber-400 mt-0.5">{formatPKR(o.pendingAmount)}</p>
                    </div>
                    <div className="bg-zinc-800/60 rounded-xl p-2">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Next Due</p>
                      {o.nextDue ? (
                        <p className={`text-xs font-semibold mt-0.5 ${isOverdue ? "text-red-400" : "text-zinc-300"}`}>
                          {o.nextDue.split("T")[0]}
                          {isOverdue && <span className="block text-[9px] text-red-500 uppercase">overdue</span>}
                        </p>
                      ) : (
                        <p className="text-xs font-semibold text-emerald-400 mt-0.5">Paid up</p>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button onClick={() => openEdit(o)} className="flex-1 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition">Edit</button>
                    <button onClick={() => openPayments(o)} className="flex-1 py-1.5 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg transition">Payments</button>
                    <button onClick={() => openSchedule(o)} className="flex-1 py-1.5 text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-lg transition">Schedule</button>
                    <button onClick={() => openTransfer(o)} className="flex-1 py-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition">Transfer</button>
                    <label className="flex-1 py-1.5 text-center text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-lg transition cursor-pointer">
                      {photoUploadingId === o._id ? "Uploading..." : "Photo"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={photoUploadingId === o._id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handlePhotoUpload(o._id, file);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                    <button onClick={() => window.open(`/api/admin/owners/${o._id}/letter?type=allotment`, "_blank")} className="flex-1 py-1.5 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg transition">Allotment</button>
                    <button onClick={() => window.open(`/api/admin/owners/${o._id}/letter?type=transfer`, "_blank")} className="flex-1 py-1.5 text-xs bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 rounded-lg transition">Transfer Letter</button>
                    {(o.transferHistory?.length ?? 0) > 0 && (
                      <button onClick={() => setHistoryOwner(o)} className="flex-1 py-1.5 text-xs bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg transition">History</button>
                    )}
                    <button onClick={() => setDeleteId(o._id)} className="flex-1 py-1.5 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-zinc-900 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-sm">
                <thead>
                  <tr className="text-left border-b border-white/[0.06]">
                    {["Registration", "Owner", "Unit", "Discount", "Total", "Paid", "Pending", "Next Due", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => {
                    const pct = o.totalAmount > 0 ? Math.round((o.amountPaid / o.totalAmount) * 100) : 0;
                    return (
                      <tr key={o._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3 text-zinc-400 font-mono text-xs whitespace-nowrap">{o.registrationNumber}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                              {o.ownerName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium">{o.ownerName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs border border-white/10 whitespace-nowrap">
                            {o.unitId?.unitNumber || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {o.discount > 0 ? (
                            <span className="text-purple-400 font-medium">{formatPKR(o.discount)}</span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-zinc-300 whitespace-nowrap">{formatPKR(o.totalAmount)}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400">{formatPKR(o.amountPaid)}</span>
                            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-zinc-500 text-xs">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-amber-400 whitespace-nowrap">{formatPKR(o.pendingAmount)}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {o.nextDue ? (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${
                              new Date(o.nextDue) < new Date()
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-zinc-800 text-zinc-300 border-white/10"
                            }`}>
                              {o.nextDue}
                              {new Date(o.nextDue) < new Date() && (
                                <span className="ml-1 text-[9px] uppercase font-bold text-red-400">overdue</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-emerald-400 text-xs font-semibold">Paid up</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => openEdit(o)} className="px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition">Edit</button>
                            <button onClick={() => openPayments(o)} className="px-2.5 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg transition">Payments</button>
                            <button onClick={() => openSchedule(o)} className="px-2.5 py-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-lg transition">Schedule</button>
                            <button onClick={() => openTransfer(o)} className="px-2.5 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition">Transfer</button>
                            <label className="px-2.5 py-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-lg transition cursor-pointer">
                              {photoUploadingId === o._id ? "Uploading..." : "Photo"}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                disabled={photoUploadingId === o._id}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) void handlePhotoUpload(o._id, file);
                                  e.currentTarget.value = "";
                                }}
                              />
                            </label>
                            <button onClick={() => window.open(`/api/admin/owners/${o._id}/letter?type=allotment`, "_blank")} className="px-2.5 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg transition">Allotment</button>
                            <button onClick={() => window.open(`/api/admin/owners/${o._id}/letter?type=transfer`, "_blank")} className="px-2.5 py-1 text-xs bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 rounded-lg transition">Transfer Letter</button>
                            {(o.transferHistory?.length ?? 0) > 0 && (
                              <button onClick={() => setHistoryOwner(o)} className="px-2.5 py-1 text-xs bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg transition">History</button>
                            )}
                            <button onClick={() => setDeleteId(o._id)} className="px-2.5 py-1 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition">Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
              <h2 className="text-white font-bold">{editing ? "Edit Owner" : "Add Owner"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
              {[
                { label: "Owner Name *", key: "ownerName", placeholder: "Full name" },
                { label: "CNIC *", key: "cnic", placeholder: "e.g. 37302-1234567-1" },
                { label: "Phone", key: "phone", placeholder: "e.g. 0300-1234567" },
                { label: "Resident Of", key: "residentOf", placeholder: "e.g. Islamabad" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{label}</label>
                  <input
                    type="text" placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              ))}

              {/* Unit select — triggers auto-fill, only shows available units */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Unit</label>
                <select value={form.unitId} onChange={(e) => handleUnitChange(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-600">
                  <option value="">Select unit…</option>
                  {units
                    .filter((u) => u.status === "available" || u._id === form.unitId)
                    .map((u) => <option key={u._id} value={u._id}>{u.unitNumber} ({u.floor})</option>)}
                </select>
              </div>

              {/* Downpayment info card — shown when plan row found */}
              {planDownpayment !== null && planDownpayment > 0 && (
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Downpayment Required</p>
                    <p className="text-white font-bold text-sm mt-0.5">{formatPKR(planDownpayment)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Discount */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Discount (Rs.)</label>
                <input
                  type="number" placeholder="e.g. 500000" value={form.discount}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                {listPrice > 0 && Number(form.discount) > 0 && (
                  <p className="text-xs text-zinc-500 mt-1">
                    List: {formatPKR(listPrice)} − Discount: {formatPKR(Number(form.discount))}
                  </p>
                )}
              </div>

              {/* Total Amount — auto-filled from plan */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Total Amount (Rs.) *</label>
                  {listPrice > 0 && (
                    <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">
                      Auto-filled from plan
                    </span>
                  )}
                </div>
                <input
                  type="number" placeholder="e.g. 5000000" value={form.totalAmount}
                  onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Amount Paid */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Amount Paid (Rs.)</label>
                <input
                  type="number" placeholder="e.g. 1500000" value={form.amountPaid}
                  onChange={(e) => setForm((f) => ({ ...f, amountPaid: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/[0.06] flex gap-2 justify-end">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {transferOwner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h2 className="text-white font-bold">Transfer Ownership</h2>
              </div>
              <button onClick={() => setTransferOwner(null)} className="text-zinc-500 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Current owner banner */}
              <div className="bg-zinc-800/60 border border-white/[0.06] rounded-xl p-3">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-semibold mb-1.5">Current Owner</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                    {transferOwner.ownerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{transferOwner.ownerName}</p>
                    <p className="text-zinc-500 text-xs">{transferOwner.cnic} · {transferOwner.unitId?.unitNumber || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-zinc-600 text-xs px-2">transfers to</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {transferError && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{transferError}</p>}

              {/* New owner fields */}
              {[
                { label: "New Owner Name *", key: "ownerName", placeholder: "Full name" },
                { label: "New CNIC *", key: "cnic", placeholder: "e.g. 37302-1234567-1" },
                { label: "New Phone", key: "phone", placeholder: "e.g. 0300-1234567" },
                { label: "Resident Of", key: "residentOf", placeholder: "e.g. Islamabad" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{label}</label>
                  <input
                    type="text" placeholder={placeholder}
                    value={transferForm[key as keyof typeof transferForm]}
                    onChange={(e) => setTransferForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Transfer Note</label>
                <input
                  type="text" placeholder="e.g. Sold to new buyer, resale, etc."
                  value={transferForm.transferNote}
                  onChange={(e) => setTransferForm((f) => ({ ...f, transferNote: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <p className="text-xs text-zinc-600 bg-zinc-800/40 rounded-lg px-3 py-2">
                The unit, registration number, total amount, and all payment history will remain unchanged. Only the owner&apos;s identity is updated.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-white/[0.06] flex gap-2 justify-end">
              <button onClick={() => setTransferOwner(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">Cancel</button>
              <button onClick={handleTransfer} disabled={transferSaving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {transferSaving ? "Transferring…" : "Confirm Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Payments Modal */}
      {paymentsOwner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-bold">Payment History</h2>
                  <p className="text-zinc-500 text-xs">{paymentsOwner.ownerName} · {paymentsOwner.registrationNumber}</p>
                </div>
              </div>
              <button onClick={() => setPaymentsOwner(null)} className="text-zinc-500 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Summary bar */}
            <div className="px-6 pt-4 pb-3 grid grid-cols-3 gap-3 border-b border-white/[0.06]">
              <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Total</p>
                <p className="text-sm font-bold text-zinc-200 mt-0.5">{formatPKR(paymentsOwner.totalAmount)}</p>
              </div>
              <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Paid</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{formatPKR(paymentsOwner.amountPaid)}</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Pending</p>
                <p className="text-sm font-bold text-amber-400 mt-0.5">{formatPKR(paymentsOwner.pendingAmount)}</p>
              </div>
            </div>

            {/* Payment list */}
            <div className="px-6 py-4 max-h-[50vh] overflow-y-auto space-y-2">
              {paymentsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-zinc-800 rounded-xl animate-pulse" />)}
                </div>
              ) : ownerPayments.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-zinc-600 text-sm">No payments recorded yet</p>
                </div>
              ) : (
                ownerPayments.map((p, idx) => (
                  <div key={p._id} className="flex items-center gap-3 bg-zinc-800/50 border border-white/[0.04] rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center text-[11px] font-bold text-emerald-400 shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">{formatPKR(p.amount)}</span>
                        <span className="text-[10px] bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded font-medium">{p.paymentMethod}</span>
                        {p.receiptNumber && (
                          <span className="text-[10px] text-zinc-600 font-mono">#{p.receiptNumber}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-zinc-500 text-xs">{new Date(p.date).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        {p.notes && <span className="text-zinc-600 text-xs truncate italic">{p.notes}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <button onClick={() => setPaymentsOwner(null)} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer History Modal */}
      {historyOwner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-bold">Ownership History</h2>
                  <p className="text-zinc-500 text-xs">{historyOwner.unitId?.unitNumber || "—"} · {historyOwner.registrationNumber}</p>
                </div>
              </div>
              <button onClick={() => setHistoryOwner(null)} className="text-zinc-500 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {/* Current owner */}
              <div className="relative pl-7 pb-6">
                <div className="absolute left-[9px] top-2 bottom-0 w-px bg-white/[0.06]" />
                <div className="absolute left-0 top-1.5 w-[19px] h-[19px] rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Current Owner</span>
                  </div>
                  <p className="text-white font-semibold text-sm">{historyOwner.ownerName}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{historyOwner.cnic} {historyOwner.phone ? `· ${historyOwner.phone}` : ""}</p>
                </div>
              </div>

              {/* Transfer history entries (newest first) */}
              {[...(historyOwner.transferHistory || [])].reverse().map((rec, idx) => {
                const isLast = idx === (historyOwner.transferHistory?.length ?? 0) - 1;
                return (
                  <div key={idx} className="relative pl-7 pb-6">
                    {!isLast && <div className="absolute left-[9px] top-2 bottom-0 w-px bg-white/[0.06]" />}
                    <div className="absolute left-0 top-1.5 w-[19px] h-[19px] rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                    </div>
                    <div className="bg-zinc-800/60 border border-white/[0.06] rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Previous Owner</span>
                        <span className="text-zinc-600 text-[10px]">
                          {new Date(rec.transferredAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p className="text-zinc-200 font-semibold text-sm">{rec.previousOwnerName}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {rec.previousCnic.replace(/^(.{5})(.*)(.{1})$/, "$1-****-$3")}
                        {rec.previousPhone ? ` · ${rec.previousPhone}` : ""}
                      </p>
                      {rec.transferNote && (
                        <p className="text-zinc-600 text-xs mt-1.5 italic border-t border-white/[0.04] pt-1.5">&ldquo;{rec.transferNote}&rdquo;</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <button onClick={() => setHistoryOwner(null)} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Installment Schedule Modal */}
      {scheduleOwner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-bold">Instalment Schedule</h2>
                  <p className="text-zinc-500 text-xs">{scheduleOwner.ownerName} · {scheduleOwner.registrationNumber}</p>
                </div>
              </div>
              <button onClick={() => setScheduleOwner(null)} className="text-zinc-500 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {scheduleLoading ? (
              <div className="px-6 py-10 space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-zinc-800 rounded-xl animate-pulse" />)}
              </div>
            ) : !ownerSchedule ? (
              <div className="px-6 py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-zinc-500 text-sm">Failed to load instalment schedule.</p>
              </div>
            ) : (
              <>
                {/* Summary bar */}
                <div className="px-6 pt-4 pb-3 grid grid-cols-3 gap-3 border-b border-white/[0.06] shrink-0">
                  <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Total</p>
                    <p className="text-sm font-bold text-zinc-200 mt-0.5">{formatPKR(ownerSchedule.totalAmount)}</p>
                  </div>
                  <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Paid</p>
                    <p className="text-sm font-bold text-emerald-400 mt-0.5">{formatPKR(ownerSchedule.amountPaid)}</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Pending</p>
                    <p className="text-sm font-bold text-amber-400 mt-0.5">{formatPKR(ownerSchedule.pendingAmount)}</p>
                  </div>
                </div>

                {/* Schedule list */}
                <div className="overflow-y-auto flex-1">
                  {!ownerSchedule.planFound || ownerSchedule.installmentSchedule.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-zinc-500 text-sm">No instalment plan on file for this unit.</p>
                      <p className="text-zinc-600 text-xs mt-1">Ensure the payment plan is configured for unit {ownerSchedule.unitNumber}.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.04]">
                      {ownerSchedule.installmentSchedule.map((inst, i) => (
                        <div key={i} className={`px-6 py-3 flex items-center justify-between gap-4 ${inst.status === "overdue" ? "bg-red-500/5" : ""}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              inst.status === "paid" ? "bg-emerald-500/20 text-emerald-400"
                              : inst.status === "overdue" ? "bg-red-500/20 text-red-400"
                              : "bg-amber-500/20 text-amber-400"
                            }`}>
                              {inst.status === "paid" ? (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                String(i + 1)
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{inst.label}</p>
                              <p className="text-zinc-500 text-xs">Due: {inst.dueDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <p className={`text-sm font-bold ${
                              inst.status === "paid" ? "text-emerald-400"
                              : inst.status === "overdue" ? "text-red-400" : "text-white"
                            }`}>{formatPKR(inst.amount)}</p>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${statusChip(inst.status)}`}>
                              {inst.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats footer */}
                {ownerSchedule.installmentSchedule.length > 0 && (
                  <div className="px-6 py-3 border-t border-white/[0.06] flex items-center gap-4 shrink-0">
                    <span className="text-xs text-emerald-400 font-semibold">{ownerSchedule.paidCount} paid</span>
                    {ownerSchedule.overdueCount > 0 && (
                      <span className="text-xs text-red-400 font-semibold">{ownerSchedule.overdueCount} overdue</span>
                    )}
                    <span className="text-xs text-amber-400 font-semibold">{ownerSchedule.upcomingCount} upcoming</span>
                    <div className="flex-1" />
                    <button onClick={() => setScheduleOwner(null)} className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition">
                      Close
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Close button when loading or error */}
            {(scheduleLoading || !ownerSchedule) && (
              <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end shrink-0">
                <button onClick={() => setScheduleOwner(null)} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition">
                  Close
                </button>
              </div>
            )}
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
            <h3 className="text-white font-bold mb-1">Delete Owner?</h3>
            <p className="text-zinc-500 text-sm mb-5">This will permanently remove this owner record.</p>
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

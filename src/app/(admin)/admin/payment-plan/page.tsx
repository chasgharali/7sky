"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminTheme } from "../admin-theme";

const FLOOR_META = [
  { id: "LGF", label: "Lower Ground Floor", short: "LGF" },
  { id: "GF",  label: "Ground Floor",       short: "GF" },
  { id: "1",   label: "1st Floor",           short: "1F" },
  { id: "2",   label: "2nd Floor",           short: "2F" },
  { id: "3",   label: "3rd Floor",           short: "3F" },
  { id: "4",   label: "4th Floor",           short: "4F" },
  { id: "5",   label: "5th Floor",           short: "5F" },
];

interface PlanRow {
  shopNo: string;
  dimensions: string;
  totalArea: number;
  pricePerSqFt: number;
  unitPrice: number;
  downpayment: number;
  remaining: number;
  quarterlyInstalment: number;
  onPossession: number;
}

interface FloorPlan {
  _id?: string;
  floor: string;
  label: string;
  rows: PlanRow[];
}

function emptyRow(): PlanRow {
  return { shopNo: "", dimensions: "", totalArea: 0, pricePerSqFt: 0, unitPrice: 0, downpayment: 0, remaining: 0, quarterlyInstalment: 0, onPossession: 0 };
}

function fmt(n: number) {
  return n ? n.toLocaleString() : "0";
}

export default function AdminPaymentPlanPage() {
  const theme = useAdminTheme();
  const isLight = theme === "light";
  const [plans, setPlans] = useState<FloorPlan[]>([]);
  const [activeFloor, setActiveFloor] = useState("LGF");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payment-plan", { credentials: "include" });
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load payment plans", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const currentPlan = plans.find((p) => p.floor === activeFloor) ?? {
    floor: activeFloor,
    label: FLOOR_META.find((f) => f.id === activeFloor)?.label ?? activeFloor,
    rows: [],
  };

  const updateRow = (rowIdx: number, field: keyof PlanRow, value: string) => {
    const updated = plans.map((p) => {
      if (p.floor !== activeFloor) return p;
      const rows = p.rows.map((r, i) => {
        if (i !== rowIdx) return r;
        const numFields: (keyof PlanRow)[] = ["totalArea", "pricePerSqFt", "unitPrice", "downpayment", "remaining", "quarterlyInstalment", "onPossession"];
        return { ...r, [field]: numFields.includes(field) ? (Number(value.replace(/,/g, "")) || 0) : value };
      });
      return { ...p, rows };
    });
    // If plan doesn't exist yet, create it
    if (!plans.find((p) => p.floor === activeFloor)) {
      const newPlan: FloorPlan = { floor: activeFloor, label: currentPlan.label, rows: [] };
      setPlans([...updated, newPlan]);
    } else {
      setPlans(updated);
    }
  };

  const addRow = () => {
    const exists = plans.find((p) => p.floor === activeFloor);
    if (exists) {
      setPlans(plans.map((p) => p.floor === activeFloor ? { ...p, rows: [...p.rows, emptyRow()] } : p));
    } else {
      setPlans([...plans, { floor: activeFloor, label: currentPlan.label, rows: [emptyRow()] }]);
    }
  };

  const deleteRow = (rowIdx: number) => {
    setPlans(plans.map((p) =>
      p.floor === activeFloor ? { ...p, rows: p.rows.filter((_, i) => i !== rowIdx) } : p
    ));
  };

  const saveFloor = async () => {
    setSaving(true);
    try {
      const plan = plans.find((p) => p.floor === activeFloor) ?? currentPlan;
      const res = await fetch("/api/admin/payment-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ floor: plan.floor, label: plan.label, rows: plan.rows }),
      });
      if (res.ok) {
        showToast(`${currentPlan.label} saved successfully`);
        fetchPlans();
      } else {
        showToast("Failed to save", "error");
      }
    } catch {
      showToast("Error saving", "error");
    } finally {
      setSaving(false);
    }
  };

  const seedAll = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/payment-plan", { method: "POST", credentials: "include" });
      if (res.ok) {
        showToast("All floors seeded from default data");
        fetchPlans();
      } else {
        showToast("Seed failed", "error");
      }
    } catch {
      showToast("Seed error", "error");
    } finally {
      setSeeding(false);
    }
  };

  const rows = currentPlan.rows;

  return (
    <div className="admin-page admin-payment-plan-page space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Plan</h1>
          <p className="text-gray-500 text-sm mt-1">Manage pricing tables for each floor</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={seedAll}
            disabled={seeding}
            className={`px-4 py-2 text-sm font-semibold border rounded-lg transition disabled:opacity-50 ${
              isLight
                ? "text-white bg-amber-600 hover:bg-amber-500 border-amber-600"
                : "text-[#c9a227] border-[#c9a227]/40 hover:bg-[#c9a227]/10"
            }`}
          >
            {seeding ? "Seeding…" : "Reset to Defaults"}
          </button>
          <button
            onClick={saveFloor}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#3b82f6] rounded-lg transition disabled:opacity-50 shadow-lg shadow-blue-900/30"
          >
            {saving ? "Saving…" : `Save ${FLOOR_META.find((f) => f.id === activeFloor)?.short}`}
          </button>
        </div>
      </div>

      {/* Floor selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FLOOR_META.map((f) => {
          const plan = plans.find((p) => p.floor === f.id);
          const active = f.id === activeFloor;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFloor(f.id)}
              className={`flex flex-col items-center px-5 py-3 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                active
                  ? "bg-[#2563eb] text-white shadow-lg shadow-blue-900/40"
                  : isLight
                    ? "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50"
                    : "bg-[#111] text-gray-400 border border-white/10 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="font-black">{f.short}</span>
              <span className="text-[10px] opacity-80 mt-0.5">{plan?.rows.length ?? 0} rows</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className={`admin-payment-plan-table rounded-2xl border overflow-hidden ${
        isLight ? "bg-white border-slate-200" : "bg-[#111] border-white/10"
      }`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}>
          <div>
            <h2 className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{currentPlan.label}</h2>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-gray-500"}`}>{rows.length} rows — click any cell to edit</p>
          </div>
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Row
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500 text-sm">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#0f4c5c]">
                  {["Shop No.", "Dimensions", "Area", "Price/Sqft", "Unit Price", "Down 25%", "Remaining 55%", "Quarterly", "On Possession 20%", ""].map((h) => (
                    <th key={h} className="px-3 py-3 text-white font-bold text-center whitespace-nowrap border-r border-[#0f4c5c]/40 last:border-r-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-gray-600">No rows yet — click &ldquo;Add Row&rdquo; to start</td>
                  </tr>
                ) : rows.map((row, ri) => (
                  <tr key={ri} className={`border-b ${isLight ? "border-slate-200" : "border-white/5"} ${
                    ri % 2 === 0
                      ? (isLight ? "bg-white" : "bg-[#0d0d0d]")
                      : (isLight ? "bg-slate-50" : "bg-[#111]")
                  }`}>
                    {(["shopNo", "dimensions", "totalArea", "pricePerSqFt", "unitPrice", "downpayment", "remaining", "quarterlyInstalment", "onPossession"] as (keyof PlanRow)[]).map((field) => (
                      <td key={field} className={`px-1 py-1 border-r ${isLight ? "border-slate-200" : "border-white/5"}`}>
                        <input
                          type="text"
                          value={["totalArea","pricePerSqFt","unitPrice","downpayment","remaining","quarterlyInstalment","onPossession"].includes(field)
                            ? fmt(row[field] as number)
                            : (row[field] as string)}
                          onChange={(e) => updateRow(ri, field, e.target.value)}
                          className={`w-full bg-transparent px-2 py-1.5 text-xs rounded focus:outline-none focus:ring-1 focus:ring-[#2563eb] transition ${
                            isLight ? "focus:bg-slate-100" : "focus:bg-white/5"
                          } ${
                            field === "unitPrice" ? (isLight ? "text-amber-700 font-bold" : "text-[#c9a227] font-bold") : (isLight ? "text-slate-700" : "text-gray-300")
                          } ${field === "shopNo" ? (isLight ? "text-slate-900 font-semibold" : "text-white font-semibold") : ""}`}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1 text-center">
                      <button
                        onClick={() => deleteRow(ri)}
                        className="p-1 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                        title="Delete row"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={`px-5 py-3 border-t flex items-center justify-between ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}>
          <span className={`text-xs ${isLight ? "text-slate-500" : "text-gray-600"}`}>All prices in PKR · Changes are not saved until you click Save</span>
          <button
            onClick={saveFloor}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#3b82f6] rounded-lg transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Floor"}
          </button>
        </div>
      </div>
    </div>
  );
}

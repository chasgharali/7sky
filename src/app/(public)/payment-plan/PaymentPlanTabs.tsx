"use client";

import { useState } from "react";

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
  floor: string;
  label: string;
  rows: PlanRow[];
}

const FLOOR_ORDER = ["LGF", "GF", "1", "2", "3", "4", "5"];
const FLOOR_SHORT: Record<string, string> = {
  LGF: "LGF", GF: "GF", "1": "1F", "2": "2F", "3": "3F", "4": "4F", "5": "5F",
};

function formatPKR(n: number) {
  if (!n) return "—";
  if (n >= 10000000) return `Rs. ${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `Rs. ${(n / 100000).toFixed(2)}L`;
  return `Rs. ${n.toLocaleString()}`;
}

export function PaymentPlanTabs({ plans }: { plans: FloorPlan[] }) {
  const sorted = [...plans].sort(
    (a, b) => FLOOR_ORDER.indexOf(a.floor) - FLOOR_ORDER.indexOf(b.floor)
  );
  const [activeFloor, setActiveFloor] = useState(sorted[0]?.floor ?? "LGF");
  const activePlan = sorted.find((p) => p.floor === activeFloor) ?? sorted[0];

  return (
    <div className="public-page space-y-6">
      {/* Floor tabs */}
      <div className="overflow-x-auto pt-2 pb-1">
        <div className="flex gap-2 min-w-max justify-center px-1">
          {sorted.map((plan) => {
            const active = plan.floor === activeFloor;
            return (
              <button
                key={plan.floor}
                onClick={() => setActiveFloor(plan.floor)}
                className={`relative flex flex-col items-center px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                  active
                    ? "public-blue-chip-active bg-[#2563eb] text-white shadow-lg shadow-blue-900/40"
                    : "bg-[var(--public-muted)] text-gray-400 hover:bg-white/5 hover:text-white border border-white/10"
                }`}
              >
                <span className="text-xs font-black">{FLOOR_SHORT[plan.floor] ?? plan.floor}</span>
                <span className="text-[10px] mt-0.5 opacity-80">{plan.label}</span>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#c9a227] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {plan.rows.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active floor header */}
      {activePlan && (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#2563eb]/20 border border-[#2563eb]/30 flex items-center justify-center">
            <span className="text-[#2563eb] text-xs font-black">{FLOOR_SHORT[activePlan.floor] ?? activePlan.floor}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{activePlan.label}</h2>
            <p className="text-gray-600 text-xs">{activePlan.rows.length} units</p>
          </div>
        </div>
      )}

      {/* Table */}
      {activePlan && (
        <div className="payment-plan-table overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="payment-plan-thead">
              <tr className="bg-gradient-to-r from-[#0f4c5c] to-[#1a3a5c]">
                <th className="px-3 py-3.5 text-white font-bold text-left border-r border-white/10">Shop No.</th>
                <th className="px-3 py-3.5 text-white font-bold text-center border-r border-white/10">Dimensions</th>
                <th className="px-3 py-3.5 text-white font-bold text-center border-r border-white/10">Area (sqft)</th>
                <th className="px-3 py-3.5 text-white font-bold text-center border-r border-white/10">Price/sqft</th>
                <th className="px-3 py-3.5 text-[#c9a227] font-bold text-center border-r border-white/10">Unit Price</th>
                <th className="px-3 py-3.5 text-emerald-400 font-bold text-center border-r border-white/10">25% Down</th>
                <th className="px-3 py-3.5 text-blue-400 font-bold text-center border-r border-white/10">55% Remain</th>
                <th className="px-3 py-3.5 text-purple-400 font-bold text-center border-r border-white/10">Quarterly</th>
                <th className="px-3 py-3.5 text-amber-400 font-bold text-center">20% Possession</th>
              </tr>
            </thead>
            <tbody>
              {activePlan.rows.map((row, i) => (
                <tr key={i} className={`border-b border-white/5 transition-colors hover:bg-white/[0.03] ${i % 2 === 0 ? "bg-[var(--public-surface)]" : "bg-[var(--public-muted)]"}`}>
                  <td className="px-3 py-3 text-white font-semibold border-r border-white/5">{row.shopNo}</td>
                  <td className="px-3 py-3 text-gray-400 text-center border-r border-white/5">{row.dimensions}</td>
                  <td className="px-3 py-3 text-gray-300 text-center border-r border-white/5">{row.totalArea?.toLocaleString()}</td>
                  <td className="px-3 py-3 text-gray-300 text-center border-r border-white/5">{row.pricePerSqFt?.toLocaleString()}</td>
                  <td className="payment-plan-money-unit px-3 py-3 font-semibold tabular-nums text-center border-r border-white/5">
                    {formatPKR(row.unitPrice)}
                  </td>
                  <td className="payment-plan-money-down px-3 py-3 font-semibold tabular-nums text-center border-r border-white/5">
                    {formatPKR(row.downpayment)}
                  </td>
                  <td className="payment-plan-money-remain px-3 py-3 font-semibold tabular-nums text-center border-r border-white/5">
                    {formatPKR(row.remaining)}
                  </td>
                  <td className="payment-plan-money-quarterly px-3 py-3 font-semibold tabular-nums text-center border-r border-white/5">
                    {formatPKR(row.quarterlyInstalment)}
                  </td>
                  <td className="payment-plan-money-possession px-3 py-3 font-semibold tabular-nums text-center">
                    {formatPKR(row.onPossession)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

interface InstallmentItem {
  label: string;
  dueDate: string;
  amount: number;
  status: "paid" | "overdue" | "upcoming";
}

interface VerifyResult {
  ownerName: string;
  unitNumber: string;
  unitFloor?: string;
  unitType?: string;
  totalAmount: number;
  amountPaid: number;
  pendingAmount: number;
  paymentCount: number;
  paymentHistorySummary: { date: string; amount: number }[];
  installmentSchedule: InstallmentItem[];
  nextDueInstallment: InstallmentItem | null;
  overdueCount: number;
}

interface VerifyOwnershipClientProps {
  initialRegistrationNumber?: string;
  autoVerifyOnLoad?: boolean;
}

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

export default function VerifyOwnershipClient({
  initialRegistrationNumber = "",
  autoVerifyOnLoad = false,
}: VerifyOwnershipClientProps) {
  const [registrationNumber, setRegistrationNumber] = useState(initialRegistrationNumber);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyRegistration = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Registration number is required.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/verify-ownership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setResult(data);
    } catch {
      setError("Failed to verify. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoVerifyOnLoad || !initialRegistrationNumber.trim()) return;
    void verifyRegistration(initialRegistrationNumber);
  }, [autoVerifyOnLoad, initialRegistrationNumber, verifyRegistration]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await verifyRegistration(registrationNumber);
  };

  const pct = result && result.totalAmount > 0
    ? Math.round((result.amountPaid / result.totalAmount) * 100)
    : 0;

  return (
    <div className="py-20 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2563eb]/10 border border-[#2563eb]/20 rounded-full text-xs text-[#2563eb] font-semibold uppercase tracking-widest">
            Ownership Verification
          </div>
          <h1 className="text-3xl font-black text-white">Verify Your Ownership</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Enter your registration number to view ownership details, payment progress, and instalment schedule.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            id="registrationNumber"
            type="text"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="e.g. 7SKY-843993"
            className="flex-1 px-4 py-3 bg-[#111] border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#2563eb] hover:bg-[#3b82f6] disabled:opacity-50 text-white font-semibold rounded-xl transition shrink-0"
          >
            {loading ? "…" : "Verify"}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-5">
            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{result.ownerName}</h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Unit {result.unitNumber}
                    {result.unitFloor && ` · Floor ${result.unitFloor}`}
                    {result.unitType && ` · ${result.unitType.charAt(0).toUpperCase() + result.unitType.slice(1)}`}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl uppercase">
                  Verified
                </span>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Payment Progress</span>
                    <span className="text-white font-bold">{pct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2563eb] to-emerald-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-white font-bold text-sm">{formatPKR(result.totalAmount)}</p>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Paid</p>
                    <p className="text-emerald-400 font-bold text-sm">{formatPKR(result.amountPaid)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Pending</p>
                    <p className="text-amber-400 font-bold text-sm">{formatPKR(result.pendingAmount)}</p>
                  </div>
                </div>

                {result.overdueCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-red-400 text-sm">
                      <span className="font-bold">{result.overdueCount} overdue instalment{result.overdueCount > 1 ? "s" : ""}</span> — please contact the sales office.
                    </p>
                  </div>
                )}

                {result.nextDueInstallment && result.nextDueInstallment.status === "upcoming" && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-[#2563eb]/10 border border-[#2563eb]/20 rounded-xl">
                    <svg className="w-4 h-4 text-[#2563eb] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-blue-300 text-sm">
                      Next: <span className="font-bold">{result.nextDueInstallment.label}</span> — {formatPKR(result.nextDueInstallment.amount)} due on {result.nextDueInstallment.dueDate}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="text-white font-bold">Instalment Schedule</h3>
                <p className="text-gray-500 text-xs mt-0.5">Based on your payment plan</p>
              </div>
              {result.installmentSchedule.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No instalment plan on file for this unit.</p>
                  <p className="text-gray-600 text-xs mt-1">Please contact the sales office for your payment schedule.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {result.installmentSchedule.map((inst, i) => (
                    <div key={i} className={`px-6 py-3 flex items-center justify-between gap-4 ${inst.status === "overdue" ? "bg-red-500/5" : ""}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          inst.status === "paid"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : inst.status === "overdue"
                              ? "bg-red-500/20 text-red-400"
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
                          <p className="text-gray-500 text-xs">Due: {inst.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className={`text-sm font-bold ${
                          inst.status === "paid"
                            ? "text-emerald-400"
                            : inst.status === "overdue"
                              ? "text-red-400"
                              : "text-white"
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

            {result.paymentHistorySummary.length > 0 && (
              <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                  <h3 className="text-white font-bold">Payment History</h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {result.paymentCount} transaction{result.paymentCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {result.paymentHistorySummary.map((p, i) => (
                    <div key={i} className="px-6 py-3 flex justify-between items-center">
                      <span className="text-gray-400 text-sm">{p.date}</span>
                      <span className="text-emerald-400 font-semibold text-sm">{formatPKR(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

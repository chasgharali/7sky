"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const CERT_IMAGE = "/docs/fgeha-building-plan-approval.jpg";
const CERT_PDF = "/docs/fgeha-building-plan-approval.pdf";

type ViewMode = "image" | "pdf";

export default function CertificateViewer({
  className = "",
  defaultMode = "image",
  showTabs = true,
}: {
  className?: string;
  defaultMode?: ViewMode;
  showTabs?: boolean;
}) {
  const [mode, setMode] = useState<ViewMode>(defaultMode);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div
        className={`overflow-hidden rounded-2xl border border-white/15 bg-[var(--public-surface)] shadow-2xl shadow-black/40 ${className}`}
      >
        {showTabs && (
          <div className="flex items-center gap-1 border-b border-white/10 bg-black/20 p-1.5">
            {(
              [
                { id: "image", label: "Certificate Scan" },
                { id: "pdf", label: "PDF Document" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id)}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                  mode === tab.id
                    ? "bg-[#c9a227]/15 text-[#c9a227] border border-[#c9a227]/40"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {mode === "image" ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative block w-full bg-white text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227]"
            aria-label="View FGEHA building plan approval certificate"
          >
            <div className="relative aspect-[3/4] w-full sm:aspect-[210/297]">
              <Image
                src={CERT_IMAGE}
                alt="FGEHA Approval of Building Plans for Commercial Plot No 19-A, Markaz G-14, Islamabad"
                fill
                className="object-contain object-top p-2 sm:p-3"
                sizes="(max-width: 768px) 100vw, 480px"
                priority
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-4 pb-4 pt-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/90">
                Tap to enlarge
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#c9a227]">
                Full view
              </span>
            </div>
          </button>
        ) : (
          <div className="relative bg-[#1a1a1a]">
            <iframe
              src={`${CERT_PDF}#toolbar=1&navpanes=0&view=FitH`}
              title="FGEHA Building Plan Approval PDF — Plot 19-A, G-14 Markaz"
              className="h-[520px] w-full border-0 sm:h-[640px]"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-black/30 px-3 py-2.5">
              <p className="text-xs text-gray-400">
                Official PDF — scroll or use browser controls to zoom
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="rounded-lg border border-white/20 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/10"
                >
                  Expand
                </button>
                <a
                  href={CERT_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/10 px-2.5 py-1 text-[11px] font-semibold text-[#c9a227] hover:bg-[#c9a227]/20"
                >
                  Open / Download
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="FGEHA building plan approval certificate"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative flex max-h-full w-full max-w-5xl flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">
                  FGEHA Building Plan Approval — Plot 19-A, G-14 Markaz
                </p>
                <div className="flex rounded-lg border border-white/15 p-0.5">
                  {(
                    [
                      { id: "image", label: "Scan" },
                      { id: "pdf", label: "PDF" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setMode(tab.id)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                        mode === tab.id
                          ? "bg-[#c9a227]/20 text-[#c9a227]"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={CERT_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#c9a227]/50 bg-[#c9a227]/10 px-3 py-1.5 text-xs font-semibold text-[#c9a227] hover:bg-[#c9a227]/20"
                >
                  Download PDF
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-white">
              {mode === "image" ? (
                <div className="max-h-[85vh] overflow-auto">
                  <Image
                    src={CERT_IMAGE}
                    alt="FGEHA Approval of Building Plans for Commercial Plot No 19-A, Markaz G-14, Islamabad — full document"
                    width={1200}
                    height={1600}
                    className="mx-auto h-auto w-full"
                    sizes="100vw"
                  />
                </div>
              ) : (
                <iframe
                  src={`${CERT_PDF}#toolbar=1&navpanes=0`}
                  title="FGEHA Building Plan Approval PDF — full view"
                  className="h-[85vh] w-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function PdfDocumentViewer({
  className = "",
  heightClass = "h-[70vh] min-h-[520px]",
}: {
  className?: string;
  heightClass?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/15 bg-[var(--public-surface)] shadow-2xl shadow-black/40 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">Official Approval PDF</p>
          <p className="text-xs text-gray-500">
            G334862 — FGEHA Building Plan Approval
          </p>
        </div>
        <a
          href={CERT_PDF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/10 px-3 py-1.5 text-xs font-semibold text-[#c9a227] hover:bg-[#c9a227]/20"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Open / Download PDF
        </a>
      </div>
      <iframe
        src={`${CERT_PDF}#toolbar=1&navpanes=0&view=FitH`}
        title="FGEHA Building Plan Approval PDF document"
        className={`w-full border-0 bg-[#1a1a1a] ${heightClass}`}
      />
    </div>
  );
}

export { CERT_IMAGE, CERT_PDF };

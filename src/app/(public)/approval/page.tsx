import type { Metadata } from "next";
import Link from "next/link";
import CertificateViewer, {
  CERT_PDF,
  PdfDocumentViewer,
} from "@/components/approval/CertificateViewer";

export const metadata: Metadata = {
  title: "FGEHA Building Plan Approval | 7Sky Plot 19-A G-14 Markaz",
  description:
    "Official FGEHA Building Control approval for Commercial Plot No 19-A, Markaz G-14, Islamabad. View and download the authenticated building plan approval certificate for 7Sky by One Capital Builders.",
};

const FACTS = [
  { label: "Issuing Authority", value: "FGEHA — Building Control Section" },
  { label: "Plot", value: "Commercial Plot No. 19-A, Markaz G-14" },
  { label: "Reference No.", value: "F. No: 3(CP-0019-A)/04/Mark-AUC/2024-HA" },
  { label: "Approval Date", value: "21 May 2026" },
  { label: "Total Covered Area", value: "43,188.51 SFT" },
  { label: "Floors Approved", value: "LGF, GF, Mezzanine, 1st–5th & Mumty" },
];

export default function ApprovalPage() {
  return (
    <div className="public-page py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="section-label mb-4 justify-center">Official Document</div>
          <div className="gold-divider mx-auto mb-6" />
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              FGEHA Approved
            </span>
          </div>
          <h1 className="font-display mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Building Plan Approval{" "}
            <span className="gradient-text-gold">Certificate</span>
          </h1>
          <p className="mx-auto max-w-2xl text-gray-400">
            Authentic approval letter issued by the Federal Government Employees
            Housing Authority (FGEHA) Building Control Section for Commercial
            Plot No. 19-A, Markaz G-14, Sector G-14, Islamabad — the site of 7Sky
            by One Capital Builders.
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2">
          <CertificateViewer />

          <div>
            <h2 className="font-display mb-6 text-2xl font-bold text-white">
              Document details
            </h2>
            <dl className="mb-8 space-y-3">
              {FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="glass-card flex flex-col gap-1 rounded-xl px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {fact.label}
                  </dt>
                  <dd className="text-sm font-medium text-white sm:text-right">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mb-8 rounded-2xl border border-[#c9a227]/25 bg-[#c9a227]/5 p-5">
              <p className="mb-2 text-sm font-semibold text-[#c9a227]">
                Why this matters
              </p>
              <p className="text-sm leading-relaxed text-gray-400">
                This certificate confirms that building plans for Plot 19-A have
                been officially approved by FGEHA Building Control — a key
                regulatory clearance that supports the authenticity and
                compliance of the 7Sky commercial project.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={CERT_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
                download
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </a>
              <Link href="/floor-plan" className="btn-primary">
                View Floor Plan
              </Link>
              <Link href="/verify-ownership" className="btn-ghost">
                Verify Ownership
              </Link>
            </div>
          </div>
        </div>

        <div id="pdf" className="mt-16 scroll-mt-28">
          <div className="mb-6 text-center">
            <div className="section-label mb-4 justify-center">Original Document</div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              View the <span className="gradient-text-gold">PDF Certificate</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-gray-400">
              The original approval PDF is embedded below. You can scroll, zoom,
              or download it for your records.
            </p>
          </div>
          <PdfDocumentViewer />
        </div>
      </div>
    </div>
  );
}

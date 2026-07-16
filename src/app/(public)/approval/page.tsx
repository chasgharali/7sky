import type { Metadata } from "next";
import Link from "next/link";
import {
  FbrCertificateViewer,
  FgehaCertificateViewer,
} from "@/components/approval/CertificateViewer";

export const metadata: Metadata = {
  title: "Official Approvals & FBR Certificate | 7Sky One Capital Builders",
  description:
    "View official FGEHA building plan approval for Plot 19-A G-14 Markaz and the FBR Certificate of Confirmation for Beneficial Owners of One Capital Builders (G334862).",
};

const FGEHA_FACTS = [
  { label: "Issuing Authority", value: "FGEHA — Building Control Section" },
  { label: "Plot", value: "Commercial Plot No. 19-A, Markaz G-14" },
  { label: "Reference No.", value: "F. No: 3(CP-0019-A)/04/Mark-AUC/2024-HA" },
  { label: "Approval Date", value: "21 May 2026" },
  { label: "Total Covered Area", value: "43,188.51 SFT" },
  { label: "Floors Approved", value: "LGF, GF, Mezzanine, 1st–5th & Mumty" },
];

const FBR_FACTS = [
  { label: "Issuing Authority", value: "Federal Board of Revenue (FBR)" },
  { label: "Certificate Type", value: "Beneficial Owner Confirmation" },
  { label: "Entity", value: "One Capital Builders" },
  { label: "Registration No.", value: "G334862" },
  { label: "Prescribed Under", value: "Rule 83A (6), Income Tax Rules, 2002" },
  { label: "Particulars Filed", value: "19 March 2025" },
];

function FactList({ facts }: { facts: { label: string; value: string }[] }) {
  return (
    <dl className="mb-8 space-y-3">
      {facts.map((fact) => (
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
  );
}

export default function ApprovalPage() {
  return (
    <div className="public-page py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="section-label mb-4 justify-center">Official Documents</div>
          <div className="gold-divider mx-auto mb-6" />
          <h1 className="font-display mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Approvals &amp;{" "}
            <span className="gradient-text-gold">Certificates</span>
          </h1>
          <p className="mx-auto max-w-2xl text-gray-400">
            Authenticated government documents for 7Sky and One Capital Builders —
            FGEHA building plan approval and FBR beneficial owner confirmation.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="#fgeha"
              className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20"
            >
              FGEHA Approval
            </a>
            <a
              href="#fbr"
              className="rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-400 hover:bg-sky-500/20"
            >
              FBR Certificate
            </a>
          </div>
        </div>

        {/* ── FGEHA Section ── */}
        <section id="fgeha" className="scroll-mt-28 mb-20">
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                FGEHA Approved
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Building Plan Approval{" "}
              <span className="gradient-text-gold">Certificate</span>
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-gray-400 lg:mx-0 mx-auto">
              Official approval letter issued by the Federal Government Employees
              Housing Authority (FGEHA) Building Control Section for Commercial
              Plot No. 19-A, Markaz G-14, Islamabad.
            </p>
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-2">
            <FgehaCertificateViewer />
            <div>
              <h3 className="font-display mb-6 text-xl font-bold text-white">
                Document details
              </h3>
              <FactList facts={FGEHA_FACTS} />
              <div className="mb-8 rounded-2xl border border-[#c9a227]/25 bg-[#c9a227]/5 p-5">
                <p className="mb-2 text-sm font-semibold text-[#c9a227]">
                  Why this matters
                </p>
                <p className="text-sm leading-relaxed text-gray-400">
                  This certificate confirms that building plans for Plot 19-A have
                  been officially approved by FGEHA Building Control — a key
                  regulatory clearance for the 7Sky commercial project.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/floor-plan" className="btn-primary">
                  View Floor Plan
                </Link>
                <Link href="/verify-ownership" className="btn-ghost">
                  Verify Ownership
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent mb-20" />

        {/* ── FBR Section ── */}
        <section id="fbr" className="scroll-mt-28">
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
                FBR Certificate
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Beneficial Owner{" "}
              <span className="gradient-text-blue">Confirmation</span>
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-gray-400 lg:mx-0 mx-auto">
              Certificate of Confirmation in Respect of Beneficial Owner issued
              by the Federal Board of Revenue for{" "}
              <span className="text-white font-medium">One Capital Builders</span>{" "}
              (Registration No. G334862), prescribed under Rule 83A (6) of the
              Income Tax Rules, 2002.
            </p>
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-2">
            <FbrCertificateViewer />
            <div>
              <h3 className="font-display mb-6 text-xl font-bold text-white">
                Certificate details
              </h3>
              <FactList facts={FBR_FACTS} />
              <div className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-5">
                <p className="mb-2 text-sm font-semibold text-sky-400">
                  Why this matters
                </p>
                <p className="text-sm leading-relaxed text-gray-400">
                  This FBR certificate confirms that beneficial owner particulars
                  for One Capital Builders were filed with the Federal Board of
                  Revenue — supporting transparency and regulatory compliance of
                  the developer behind 7Sky.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { PaymentPlanTabs } from "./PaymentPlanTabs";
import dbConnect from "@/lib/db/connection";
import { PaymentPlan } from "@/lib/db/models";

export const metadata: Metadata = {
  title: "Payment Plan – Shop & Office for Sale on Installment in G-14 Islamabad",
  description:
    "Easy installment plans for shops and offices for sale in G-14 Markaz Islamabad. 25% down payment, quarterly installments over 3.5 years. Buy commercial property at 7Sky by One Capital Builders.",
};

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

const FALLBACK_PLANS: FloorPlan[] = [
  {
    floor: "LGF", label: "Lower Ground Floor",
    rows: [
      { shopNo: "LGF-1 C",           dimensions: "11 x 40",     totalArea: 440, pricePerSqFt: 115000, unitPrice: 50600000, downpayment: 12650000, remaining: 27830000, quarterlyInstalment: 1987857, onPossession: 10120000 },
      { shopNo: "LGF-2,3,4,5,6",     dimensions: "11 x 26",     totalArea: 286, pricePerSqFt: 115000, unitPrice: 32890000, downpayment:  8222500, remaining: 18089500, quarterlyInstalment: 1292107, onPossession:  6578000 },
      { shopNo: "LGF-7",             dimensions: "11.6 x 26",   totalArea: 300, pricePerSqFt: 115000, unitPrice: 34500000, downpayment:  8625000, remaining: 18975000, quarterlyInstalment: 1355357, onPossession:  6900000 },
      { shopNo: "LGF-8 SC",          dimensions: "15 x 26",     totalArea: 357, pricePerSqFt: 120750, unitPrice: 43107750, downpayment: 10776938, remaining: 23709263, quarterlyInstalment: 1693519, onPossession:  8621550 },
      { shopNo: "LGF-9 C",           dimensions: "11 x 40",     totalArea: 440, pricePerSqFt:  95000, unitPrice: 41800000, downpayment: 10450000, remaining: 22990000, quarterlyInstalment: 1642143, onPossession:  8360000 },
      { shopNo: "LGF-10,11,12,13,14",dimensions: "11 x 26",     totalArea: 286, pricePerSqFt:  95000, unitPrice: 27170000, downpayment:  6792500, remaining: 14943500, quarterlyInstalment: 1067393, onPossession:  5434000 },
      { shopNo: "LGF-15",            dimensions: "11.9 x 26",   totalArea: 300, pricePerSqFt:  95000, unitPrice: 28500000, downpayment:  7125000, remaining: 15675000, quarterlyInstalment: 1119643, onPossession:  5700000 },
      { shopNo: "LGF-16",            dimensions: "11.2 x 26",   totalArea: 280, pricePerSqFt:  95000, unitPrice: 26600000, downpayment:  6650000, remaining: 14630000, quarterlyInstalment: 1045000, onPossession:  5320000 },
      { shopNo: "LGF-17",            dimensions: "11.2 x 20.9", totalArea: 233, pricePerSqFt:  95000, unitPrice: 22135000, downpayment:  5533750, remaining: 12174250, quarterlyInstalment:  869589, onPossession:  4427000 },
    ],
  },
  {
    floor: "GF", label: "Ground Floor",
    rows: [
      { shopNo: "G-01 FC",       dimensions: "15.6 x 22.7", totalArea: 342, pricePerSqFt: 148500, unitPrice: 50787000, downpayment: 12696750, remaining: 27932850, quarterlyInstalment: 1995204, onPossession: 10157400 },
      { shopNo: "G-02,3,4,5",    dimensions: "11 x 27",     totalArea: 297, pricePerSqFt: 135000, unitPrice: 40095000, downpayment: 10023750, remaining: 22052250, quarterlyInstalment: 1575161, onPossession:  8019000 },
      { shopNo: "G-06 SC",       dimensions: "11.9 x 27",   totalArea: 317, pricePerSqFt: 141750, unitPrice: 44934750, downpayment: 11233688, remaining: 24714113, quarterlyInstalment: 1765294, onPossession:  8986950 },
      { shopNo: "G-07 SC",       dimensions: "13.3 x 15.10",totalArea: 211, pricePerSqFt: 141750, unitPrice: 29909250, downpayment:  7477313, remaining: 16450088, quarterlyInstalment: 1175006, onPossession:  5981850 },
      { shopNo: "G-08 C",        dimensions: "15.6 x 22.7", totalArea: 351, pricePerSqFt: 132000, unitPrice: 46332000, downpayment: 11583000, remaining: 25482600, quarterlyInstalment: 1820186, onPossession:  9266400 },
      { shopNo: "G-09,10,11,12", dimensions: "11 x 27",     totalArea: 297, pricePerSqFt: 120000, unitPrice: 35640000, downpayment:  8910000, remaining: 19602000, quarterlyInstalment: 1400143, onPossession:  7128000 },
      { shopNo: "G-13 SC",       dimensions: "11.9 x 27",   totalArea: 317, pricePerSqFt: 126000, unitPrice: 39942000, downpayment:  9985500, remaining: 21968100, quarterlyInstalment: 1569150, onPossession:  7988400 },
      { shopNo: "G-14 SC",       dimensions: "13.3 x 15.10",totalArea: 211, pricePerSqFt: 120000, unitPrice: 25320000, downpayment:  6330000, remaining: 13926000, quarterlyInstalment:  994714, onPossession:  5064000 },
    ],
  },
];

async function getPaymentPlans(): Promise<FloorPlan[]> {
  try {
    await dbConnect();
    const plans = await PaymentPlan.find().sort({ floor: 1 }).lean();
    return Array.isArray(plans) && plans.length > 0
      ? (plans as unknown as FloorPlan[])
      : FALLBACK_PLANS;
  } catch {
    return FALLBACK_PLANS;
  }
}

export default async function PaymentPlanPage() {
  const plans = await getPaymentPlans();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Page header — matches Floor Plan style */}
      <div className="relative pt-28 pb-14 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2563eb]/5 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/30 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <div className="section-label mb-4">Payment Plan</div>
          <div className="gold-divider mb-6" />
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3">
                Shop &amp; Office Payment Plans on Easy Installments
                <br />
                <span className="gradient-text-gold text-2xl sm:text-3xl">7Sky Commercial Plaza, G-14 Markaz Islamabad</span>
              </h1>
              <p className="text-gray-400 text-base max-w-xl">
                Buy shops and offices for sale in G-14 Markaz, Islamabad on easy installments.
                Transparent pricing with a structured 3.5-year installment schedule designed for investors.
              </p>
            </div>
            {/* Payment structure badges */}
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              {[
                { label: "25% Down", color: "text-emerald-400 border-emerald-500/30" },
                { label: "55% Instalments", color: "text-blue-400 border-blue-500/30" },
                { label: "20% Possession", color: "text-amber-400 border-amber-500/30" },
              ].map((s) => (
                <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border text-xs font-medium ${s.color}`}>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Summary cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { pct: "25%", label: "Down Payment",  desc: "On booking confirmation",            color: "from-emerald-600/20 to-emerald-600/5", border: "border-emerald-600/30", text: "text-emerald-400" },
            { pct: "55%", label: "Instalments",    desc: "14 quarterly payments over 3.5 years", color: "from-blue-600/20 to-blue-600/5",    border: "border-blue-600/30",    text: "text-blue-400" },
            { pct: "20%", label: "On Possession",  desc: "Final payment at handover",            color: "from-amber-600/20 to-amber-600/5",  border: "border-amber-600/30",   text: "text-amber-400" },
          ].map((card) => (
            <div key={card.pct} className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-6 text-center`}>
              <p className={`text-4xl font-black ${card.text} mb-1`}>{card.pct}</p>
              <p className="text-white font-bold text-sm">{card.label}</p>
              <p className="text-gray-500 text-xs mt-1">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Floor tabs + table — client component */}
        <PaymentPlanTabs plans={plans} />

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-[#111] border border-white/10 rounded-2xl text-center">
          <p className="text-xs text-gray-500 max-w-3xl mx-auto leading-relaxed">
            * All prices are in PKR. Prices subject to change without prior notice. The above payment schedule is indicative.
            For exact terms and availability please contact our sales team directly.
          </p>
          <a
            href="https://api.whatsapp.com/send/?phone=923347444432&text=Hi+Team%2C+I%27m+interested+in+7Sky.+Please+share+payment+plan+details.&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[#25d366] hover:bg-[#22c55e] text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-green-900/20"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
            </svg>
            Inquire via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

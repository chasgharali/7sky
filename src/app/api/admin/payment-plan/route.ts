import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { PaymentPlan } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";

// Hardcoded seed data – used when initializing empty DB
const SEED_DATA = [
  {
    floor: "LGF", label: "Lower Ground Floor",
    rows: [
      { shopNo: "LGF-1 C",          dimensions: "11 x 40",     totalArea: 440, pricePerSqFt: 115000, unitPrice: 50600000, downpayment: 12650000, remaining: 27830000, quarterlyInstalment: 1987857, onPossession: 10120000 },
      { shopNo: "LGF-2,3,4,5,6",    dimensions: "11 x 26",     totalArea: 286, pricePerSqFt: 115000, unitPrice: 32890000, downpayment:  8222500, remaining: 18089500, quarterlyInstalment: 1292107, onPossession:  6578000 },
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
  {
    floor: "1", label: "1st Floor",
    rows: [
      { shopNo: "1F-1 C",             dimensions: "14 x 38.7",  totalArea: 546, pricePerSqFt: 55000, unitPrice: 30030000, downpayment: 7507500, remaining: 16516500, quarterlyInstalment: 1179750, onPossession: 6006000 },
      { shopNo: "1F-2",               dimensions: "11 x 30.4",  totalArea: 339, pricePerSqFt: 50000, unitPrice: 16950000, downpayment: 4237500, remaining:  9322500, quarterlyInstalment:  665893, onPossession: 3390000 },
      { shopNo: "1F-3,4,5,6,7",       dimensions: "11 x 39",    totalArea: 429, pricePerSqFt: 50000, unitPrice: 21450000, downpayment: 5362500, remaining: 11797500, quarterlyInstalment:  842679, onPossession: 4290000 },
      { shopNo: "1F-8",               dimensions: "11 x 26.9",  totalArea: 325, pricePerSqFt: 50000, unitPrice: 16250000, downpayment: 4062500, remaining:  8937500, quarterlyInstalment:  638393, onPossession: 3250000 },
      { shopNo: "1F-09",              dimensions: "12 x 31.10", totalArea: 383, pricePerSqFt: 50000, unitPrice: 19150000, downpayment: 4787500, remaining: 10532500, quarterlyInstalment:  752321, onPossession: 3830000 },
      { shopNo: "1F-10 C",            dimensions: "14 x 38.7",  totalArea: 545, pricePerSqFt: 55000, unitPrice: 29975000, downpayment: 7493750, remaining: 16486250, quarterlyInstalment: 1177589, onPossession: 5995000 },
      { shopNo: "1F-11",              dimensions: "11 x 32.3",  totalArea: 362, pricePerSqFt: 50000, unitPrice: 18100000, downpayment: 4525000, remaining:  9955000, quarterlyInstalment:  711071, onPossession: 3620000 },
      { shopNo: "1F-12,13,14,15,16",  dimensions: "11 x 39",    totalArea: 429, pricePerSqFt: 50000, unitPrice: 21450000, downpayment: 5362500, remaining: 11797500, quarterlyInstalment:  842679, onPossession: 4290000 },
      { shopNo: "1F-17",              dimensions: "11 x 26.9",  totalArea: 325, pricePerSqFt: 50000, unitPrice: 16250000, downpayment: 4062500, remaining:  8937500, quarterlyInstalment:  638393, onPossession: 3250000 },
      { shopNo: "1F-18",              dimensions: "12 x 31.10", totalArea: 383, pricePerSqFt: 50000, unitPrice: 19150000, downpayment: 4787500, remaining: 10532500, quarterlyInstalment:  752321, onPossession: 3830000 },
    ],
  },
  {
    floor: "2", label: "2nd Floor",
    rows: [
      { shopNo: "2F-1 C",      dimensions: "11.9 x 27.6", totalArea: 304, pricePerSqFt: 63250, unitPrice: 19228000, downpayment: 4807000, remaining: 10575400, quarterlyInstalment: 755386, onPossession: 3845600 },
      { shopNo: "2F-2,3,4,5",  dimensions: "11 x 27.6",   totalArea: 303, pricePerSqFt: 55000, unitPrice: 16665000, downpayment: 4166250, remaining:  9165750, quarterlyInstalment: 654696, onPossession: 3333000 },
      { shopNo: "2F-6,7 C",    dimensions: "11.9 x 27.6", totalArea: 323, pricePerSqFt: 63250, unitPrice: 20429750, downpayment: 5107438, remaining: 11236363, quarterlyInstalment: 802597, onPossession: 4085950 },
      { shopNo: "2F-8,9,10,11",dimensions: "11 x 27.6",   totalArea: 303, pricePerSqFt: 55000, unitPrice: 16665000, downpayment: 4166250, remaining:  9165750, quarterlyInstalment: 654696, onPossession: 3333000 },
      { shopNo: "2F-12 C",     dimensions: "11.9 x 27.6", totalArea: 323, pricePerSqFt: 63250, unitPrice: 20429750, downpayment: 5107438, remaining: 11236363, quarterlyInstalment: 802597, onPossession: 4085950 },
    ],
  },
  {
    floor: "3", label: "3rd Floor",
    rows: [
      { shopNo: "3F-1 C",      dimensions: "11.9 x 27.6", totalArea: 304, pricePerSqFt: 47250, unitPrice: 14364000, downpayment: 3591000, remaining: 7900200, quarterlyInstalment: 564300, onPossession: 2872800 },
      { shopNo: "3F-2,3,4,5",  dimensions: "11 x 27.6",   totalArea: 303, pricePerSqFt: 45000, unitPrice: 13635000, downpayment: 3408750, remaining: 7499250, quarterlyInstalment: 535661, onPossession: 2727000 },
      { shopNo: "3F-6,7 C",    dimensions: "11.9 x 27.6", totalArea: 323, pricePerSqFt: 47250, unitPrice: 15261750, downpayment: 3815438, remaining: 8393963, quarterlyInstalment: 599569, onPossession: 3052350 },
      { shopNo: "3F-8,9,10,11",dimensions: "11 x 27.6",   totalArea: 303, pricePerSqFt: 45000, unitPrice: 13635000, downpayment: 3408750, remaining: 7499250, quarterlyInstalment: 535661, onPossession: 2727000 },
      { shopNo: "3F-12 C",     dimensions: "11.9 x 27.6", totalArea: 323, pricePerSqFt: 47250, unitPrice: 15261750, downpayment: 3815438, remaining: 8393963, quarterlyInstalment: 599569, onPossession: 3052350 },
    ],
  },
  {
    floor: "4", label: "4th Floor",
    rows: [
      { shopNo: "4F-1 C",    dimensions: "11.9 x 27.6", totalArea: 304, pricePerSqFt: 55000, unitPrice: 16720000, downpayment: 4180000, remaining:  9196000, quarterlyInstalment: 656857, onPossession: 3344000 },
      { shopNo: "4F-2,3 TC", dimensions: "11.9 x 27.6", totalArea: 323, pricePerSqFt: 57500, unitPrice: 18572500, downpayment: 4643125, remaining: 10214875, quarterlyInstalment: 729634, onPossession: 3714500 },
      { shopNo: "4F-4 C",    dimensions: "11.9 x 27.6", totalArea: 323, pricePerSqFt: 50000, unitPrice: 16150000, downpayment: 4037500, remaining:  8882500, quarterlyInstalment: 634464, onPossession: 3230000 },
      { shopNo: "4F-5 C",    dimensions: "11.9 x 27.6", totalArea: 323, pricePerSqFt: 55000, unitPrice: 17765000, downpayment: 4441250, remaining:  9770750, quarterlyInstalment: 697911, onPossession: 3553000 },
      { shopNo: "4F-6,7 TC", dimensions: "11.9 x 27.6", totalArea: 323, pricePerSqFt: 57500, unitPrice: 18572500, downpayment: 4643125, remaining: 10214875, quarterlyInstalment: 729634, onPossession: 3714500 },
      { shopNo: "4F-8 C",    dimensions: "11.9 x 27.6", totalArea: 323, pricePerSqFt: 50000, unitPrice: 16150000, downpayment: 4037500, remaining:  8882500, quarterlyInstalment: 634464, onPossession: 3230000 },
    ],
  },
  {
    floor: "5", label: "5th Floor",
    rows: [
      { shopNo: "5F-1 C",  dimensions: "11.9 x 27.6", totalArea: 304, pricePerSqFt: 49500, unitPrice: 15048000, downpayment: 3762000, remaining: 8276400, quarterlyInstalment: 591171, onPossession: 3009600 },
      { shopNo: "5F-2,3,4",dimensions: "11.9 x 27.6", totalArea: 323, pricePerSqFt: 47250, unitPrice: 15261750, downpayment: 3815438, remaining: 8393963, quarterlyInstalment: 599569, onPossession: 3052350 },
      { shopNo: "5F-5 C",  dimensions: "11.9 x 27.6", totalArea: 323, pricePerSqFt: 49500, unitPrice: 15988500, downpayment: 3997125, remaining: 8793675, quarterlyInstalment: 628120, onPossession: 3197700 },
      { shopNo: "5F-6,7,8",dimensions: "11.9 x 27.6", totalArea: 323, pricePerSqFt: 47250, unitPrice: 15261750, downpayment: 3815438, remaining: 8393963, quarterlyInstalment: 599569, onPossession: 3052350 },
    ],
  },
];

/** GET /api/admin/payment-plan — returns all floor plans */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "dashboard");
  if (!auth.success) return auth.response;

  await dbConnect();

  let plans = await PaymentPlan.find().sort({ floor: 1 }).lean();

  // Auto-seed if empty
  if (plans.length === 0) {
    await PaymentPlan.insertMany(SEED_DATA);
    plans = await PaymentPlan.find().sort({ floor: 1 }).lean();
  }

  return NextResponse.json(plans);
}

/** PUT /api/admin/payment-plan — upsert one floor's data */
export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request, "dashboard");
  if (!auth.success) return auth.response;

  const body = await request.json();
  const {
    floor,
    label,
    rows,
    floorImageUrl,
    floorImagePublicId,
  }: {
    floor?: string;
    label?: string;
    rows?: unknown[];
    floorImageUrl?: string;
    floorImagePublicId?: string;
  } = body;

  if (!floor || !Array.isArray(rows)) {
    return NextResponse.json({ error: "floor and rows required" }, { status: 400 });
  }

  await dbConnect();

  const updateDoc: {
    floor: string;
    label: string;
    rows: unknown[];
    floorImageUrl?: string;
    floorImagePublicId?: string;
  } = {
    floor,
    label: label || floor,
    rows,
  };

  if (typeof floorImageUrl === "string") updateDoc.floorImageUrl = floorImageUrl;
  if (typeof floorImagePublicId === "string") updateDoc.floorImagePublicId = floorImagePublicId;

  const updated = await PaymentPlan.findOneAndUpdate({ floor }, updateDoc, {
    upsert: true,
    new: true,
  });

  return NextResponse.json({ success: true, plan: updated });
}

/** POST /api/admin/payment-plan/seed — (re)seed all floors from hardcoded data */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, "dashboard");
  if (!auth.success) return auth.response;

  await dbConnect();

  for (const plan of SEED_DATA) {
    await PaymentPlan.findOneAndUpdate(
      { floor: plan.floor },
      plan,
      { upsert: true }
    );
  }

  return NextResponse.json({ success: true, message: "Seeded all floors" });
}

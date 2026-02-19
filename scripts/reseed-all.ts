/**
 * FULL RESEED SCRIPT
 * Clears Units, Owners, Payments, BookingRequests, PaymentPlans then
 * reseeds from confirmed 7Sky brochure + investor list data.
 *
 * Unit number format: PREFIX-NN (zero-padded 2-digit)
 *   e.g. LGF-01, G-01, 1F-01, 2F-01, 4F-01 …
 *
 * Run: npx tsx scripts/reseed-all.ts
 */

import * as path from "path";
import * as fs from "fs";
import mongoose from "mongoose";

// ─── Load .env.local ─────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://capital:7skyQazMlp@cluster0.o4zgoea.mongodb.net/7sky";

// ─── Random 6-digit registration number ──────────────────────────────────────
const usedRegNums = new Set<number>();
function randomRegNo(): string {
  let n: number;
  do { n = Math.floor(100000 + Math.random() * 900000); } while (usedRegNums.has(n));
  usedRegNums.add(n);
  return `7SKY-${n}`;
}

// ─── PAYMENT PLAN DATA (brochure display format — kept as grouped rows) ───────
// Fields: shopNo, dimensions, totalArea, pricePerSqFt, unitPrice,
//         downpayment(25%), remaining(55%), quarterly(14 instalments), onPossession(20%)
type PlanRow = [string, string, number, number, number, number, number, number, number];

const PAYMENT_PLANS: { floor: string; label: string; rows: PlanRow[] }[] = [
  {
    floor: "LGF", label: "Lower Ground Floor",
    rows: [
      ["LGF-01 C",            "11 x 40",     440, 115000, 50600000, 12650000, 27830000, 1987857,  10120000],
      ["LGF-02,03,04,05,06",  "11 x 26",     286, 115000, 32890000,  8222500, 18089500, 1292107,   6578000],
      ["LGF-07",              "11.6 x 26",   300, 115000, 34500000,  8625000, 18975000, 1355357,   6900000],
      ["LGF-08 SC",           "15 x 26",     357, 120750, 43107750, 10776938, 23709263, 1693519,   8621550],
      ["LGF-09 C",            "11 x 40",     440,  95000, 41800000, 10450000, 22990000, 1642143,   8360000],
      ["LGF-10,11,12,13,14",  "11 x 26",     286,  95000, 27170000,  6792500, 14943500, 1067393,   5434000],
      ["LGF-15",              "11.9 x 26",   300,  95000, 28500000,  7125000, 15675000, 1119643,   5700000],
      ["LGF-16",              "11.2 x 26",   280,  95000, 26600000,  6650000, 14630000, 1045000,   5320000],
      ["LGF-17",              "11.2 x 20.9", 233,  95000, 22135000,  5533750, 12174250,  869589,   4427000],
    ],
  },
  {
    floor: "GF", label: "Ground Floor",
    rows: [
      ["G-01 FC",       "15.6 x 22.7",  342, 148500, 50787000, 12696750, 27932850, 1995204, 10157400],
      ["G-02,03,04,05", "11 x 27",      297, 135000, 40095000, 10023750, 22052250, 1575161,  8019000],
      ["G-06 SC",       "11.9 x 27",    317, 141750, 44934750, 11233688, 24714113, 1765294,  8986950],
      ["G-07 SC",       "13.3 x 15.10", 211, 141750, 29909250,  7477313, 16450088, 1175006,  5981850],
      ["G-08 C",        "15.6 x 22.7",  351, 132000, 46332000, 11583000, 25482600, 1820186,  9266400],
      ["G-09,10,11,12", "11 x 27",      297, 120000, 35640000,  8910000, 19602000, 1400143,  7128000],
      ["G-13 SC",       "11.9 x 27",    317, 126000, 39942000,  9985500, 21968100, 1569150,  7988400],
      ["G-14 SC",       "13.3 x 15.10", 211, 120000, 25320000,  6330000, 13926000,  994714,  5064000],
    ],
  },
  {
    floor: "1", label: "1st Floor",
    rows: [
      ["1F-01 C",              "14 x 38.7",  546, 55000, 30030000, 7507500, 16516500, 1179750, 6006000],
      ["1F-02",                "11 x 30.4",  339, 50000, 16950000, 4237500,  9322500,  665893, 3390000],
      ["1F-03,04,05,06,07",    "11 x 39",    429, 50000, 21450000, 5362500, 11797500,  842679, 4290000],
      ["1F-08",                "11 x 26.9",  325, 50000, 16250000, 4062500,  8937500,  638393, 3250000],
      ["1F-09",                "12 x 31.10", 383, 50000, 19150000, 4787500, 10532500,  752321, 3830000],
      ["1F-10 C",              "14 x 38.7",  545, 55000, 29975000, 7493750, 16486250, 1177589, 5995000],
      ["1F-11",                "11 x 32.3",  362, 50000, 18100000, 4525000,  9955000,  711071, 3620000],
      ["1F-12,13,14,15,16",    "11 x 39",    429, 50000, 21450000, 5362500, 11797500,  842679, 4290000],
      ["1F-17",                "11 x 26.9",  325, 50000, 16250000, 4062500,  8937500,  638393, 3250000],
      ["1F-18",                "12 x 31.10", 383, 50000, 19150000, 4787500, 10532500,  752321, 3830000],
    ],
  },
  {
    floor: "2", label: "2nd Floor",
    rows: [
      ["2F-01 C",       "11.9 x 27.6", 304, 63250, 19228000, 4807000, 10575400, 755386, 3845600],
      ["2F-02,03,04,05","11 x 27.6",   303, 55000, 16665000, 4166250,  9165750, 654696, 3333000],
      ["2F-06,07 C",    "11.9 x 27.6", 323, 63250, 20429750, 5107438, 11236363, 802597, 4085950],
      ["2F-08,09,10,11","11 x 27.6",   303, 55000, 16665000, 4166250,  9165750, 654696, 3333000],
      ["2F-12 C",       "11.9 x 27.6", 323, 63250, 20429750, 5107438, 11236363, 802597, 4085950],
    ],
  },
  {
    floor: "3", label: "3rd Floor",
    rows: [
      ["3F-01 C",       "11.9 x 27.6", 304, 47250, 14364000, 3591000, 7900200, 564300, 2872800],
      ["3F-02,03,04,05","11 x 27.6",   303, 45000, 13635000, 3408750, 7499250, 535661, 2727000],
      ["3F-06,07 C",    "11.9 x 27.6", 323, 47250, 15261750, 3815438, 8393963, 599569, 3052350],
      ["3F-08,09,10,11","11 x 27.6",   303, 45000, 13635000, 3408750, 7499250, 535661, 2727000],
      ["3F-12 C",       "11.9 x 27.6", 323, 47250, 15261750, 3815438, 8393963, 599569, 3052350],
    ],
  },
  {
    floor: "4", label: "4th Floor",
    rows: [
      ["4F-01 C",    "11.9 x 27.6", 304, 55000, 16720000, 4180000,  9196000, 656857, 3344000],
      ["4F-02,03 TC","11.9 x 27.6", 323, 57500, 18572500, 4643125, 10214875, 729634, 3714500],
      ["4F-04 C",    "11.9 x 27.6", 323, 50000, 16150000, 4037500,  8882500, 634464, 3230000],
      ["4F-05 C",    "11.9 x 27.6", 323, 55000, 17765000, 4441250,  9770750, 697911, 3553000],
      ["4F-06,07 TC","11.9 x 27.6", 323, 57500, 18572500, 4643125, 10214875, 729634, 3714500],
      ["4F-08 C",    "11.9 x 27.6", 323, 50000, 16150000, 4037500,  8882500, 634464, 3230000],
    ],
  },
  {
    floor: "5", label: "5th Floor",
    rows: [
      ["5F-01 C",    "11.9 x 27.6", 304, 49500, 15048000, 3762000, 8276400, 591171, 3009600],
      ["5F-02,03,04","11.9 x 27.6", 323, 47250, 15261750, 3815438, 8393963, 599569, 3052350],
      ["5F-05 C",    "11.9 x 27.6", 323, 49500, 15988500, 3997125, 8793675, 628120, 3197700],
      ["5F-06,07,08","11.9 x 27.6", 323, 47250, 15261750, 3815438, 8393963, 599569, 3052350],
    ],
  },
];

// ─── INDIVIDUAL UNITS (fully expanded, uniform PREFIX-NN format) ──────────────
// Each entry: [ unitNumber, floor, dimensions, size(sqft), price ]
type UnitRow = [string, string, string, number, number];

const ALL_UNITS: UnitRow[] = [
  // ── Lower Ground Floor ────────────────────────────────────────────────────
  ["LGF-01", "LGF", "11 x 40",     440, 50600000],
  ["LGF-02", "LGF", "11 x 26",     286, 32890000],
  ["LGF-03", "LGF", "11 x 26",     286, 32890000],
  ["LGF-04", "LGF", "11 x 26",     286, 32890000],
  ["LGF-05", "LGF", "11 x 26",     286, 32890000],
  ["LGF-06", "LGF", "11 x 26",     286, 32890000],
  ["LGF-07", "LGF", "11.6 x 26",   300, 34500000],
  ["LGF-08", "LGF", "15 x 26",     357, 43107750],
  ["LGF-09", "LGF", "11 x 40",     440, 41800000],
  ["LGF-10", "LGF", "11 x 26",     286, 27170000],
  ["LGF-11", "LGF", "11 x 26",     286, 27170000],
  ["LGF-12", "LGF", "11 x 26",     286, 27170000],
  ["LGF-13", "LGF", "11 x 26",     286, 27170000],
  ["LGF-14", "LGF", "11 x 26",     286, 27170000],
  ["LGF-15", "LGF", "11.9 x 26",   300, 28500000],
  ["LGF-16", "LGF", "11.2 x 26",   280, 26600000],
  ["LGF-17", "LGF", "11.2 x 20.9", 233, 22135000],

  // ── Ground Floor ──────────────────────────────────────────────────────────
  ["G-01", "GF", "15.6 x 22.7",  342, 50787000],
  ["G-02", "GF", "11 x 27",      297, 40095000],
  ["G-03", "GF", "11 x 27",      297, 40095000],
  ["G-04", "GF", "11 x 27",      297, 40095000],
  ["G-05", "GF", "11 x 27",      297, 40095000],
  ["G-06", "GF", "11.9 x 27",    317, 44934750],
  ["G-07", "GF", "13.3 x 15.10", 211, 29909250],
  ["G-08", "GF", "15.6 x 22.7",  351, 46332000],
  ["G-09", "GF", "11 x 27",      297, 35640000],
  ["G-10", "GF", "11 x 27",      297, 35640000],
  ["G-11", "GF", "11 x 27",      297, 35640000],
  ["G-12", "GF", "11 x 27",      297, 35640000],
  ["G-13", "GF", "11.9 x 27",    317, 39942000],
  ["G-14", "GF", "13.3 x 15.10", 211, 25320000],

  // ── 1st Floor ─────────────────────────────────────────────────────────────
  ["1F-01", "1", "14 x 38.7",  546, 30030000],
  ["1F-02", "1", "11 x 30.4",  339, 16950000],
  ["1F-03", "1", "11 x 39",    429, 21450000],
  ["1F-04", "1", "11 x 39",    429, 21450000],
  ["1F-05", "1", "11 x 39",    429, 21450000],
  ["1F-06", "1", "11 x 39",    429, 21450000],
  ["1F-07", "1", "11 x 39",    429, 21450000],
  ["1F-08", "1", "11 x 26.9",  325, 16250000],
  ["1F-09", "1", "12 x 31.10", 383, 19150000],
  ["1F-10", "1", "14 x 38.7",  545, 29975000],
  ["1F-11", "1", "11 x 32.3",  362, 18100000],
  ["1F-12", "1", "11 x 39",    429, 21450000],
  ["1F-13", "1", "11 x 39",    429, 21450000],
  ["1F-14", "1", "11 x 39",    429, 21450000],
  ["1F-15", "1", "11 x 39",    429, 21450000],
  ["1F-16", "1", "11 x 39",    429, 21450000],
  ["1F-17", "1", "11 x 26.9",  325, 16250000],
  ["1F-18", "1", "12 x 31.10", 383, 19150000],

  // ── 2nd Floor ─────────────────────────────────────────────────────────────
  ["2F-01", "2", "11.9 x 27.6", 304, 19228000],
  ["2F-02", "2", "11 x 27.6",   303, 16665000],
  ["2F-03", "2", "11 x 27.6",   303, 16665000],
  ["2F-04", "2", "11 x 27.6",   303, 16665000],
  ["2F-05", "2", "11 x 27.6",   303, 16665000],
  ["2F-06", "2", "11.9 x 27.6", 323, 20429750],
  ["2F-07", "2", "11.9 x 27.6", 323, 20429750],
  ["2F-08", "2", "11 x 27.6",   303, 16665000],
  ["2F-09", "2", "11 x 27.6",   303, 16665000],
  ["2F-10", "2", "11 x 27.6",   303, 16665000],
  ["2F-11", "2", "11 x 27.6",   303, 16665000],
  ["2F-12", "2", "11.9 x 27.6", 323, 20429750],

  // ── 3rd Floor ─────────────────────────────────────────────────────────────
  ["3F-01", "3", "11.9 x 27.6", 304, 14364000],
  ["3F-02", "3", "11 x 27.6",   303, 13635000],
  ["3F-03", "3", "11 x 27.6",   303, 13635000],
  ["3F-04", "3", "11 x 27.6",   303, 13635000],
  ["3F-05", "3", "11 x 27.6",   303, 13635000],
  ["3F-06", "3", "11.9 x 27.6", 323, 15261750],
  ["3F-07", "3", "11.9 x 27.6", 323, 15261750],
  ["3F-08", "3", "11 x 27.6",   303, 13635000],
  ["3F-09", "3", "11 x 27.6",   303, 13635000],
  ["3F-10", "3", "11 x 27.6",   303, 13635000],
  ["3F-11", "3", "11 x 27.6",   303, 13635000],
  ["3F-12", "3", "11.9 x 27.6", 323, 15261750],

  // ── 4th Floor ─────────────────────────────────────────────────────────────
  ["4F-01", "4", "11.9 x 27.6", 304, 16720000],
  ["4F-02", "4", "11.9 x 27.6", 323, 18572500],
  ["4F-03", "4", "11.9 x 27.6", 323, 18572500],
  ["4F-04", "4", "11.9 x 27.6", 323, 16150000],
  ["4F-05", "4", "11.9 x 27.6", 323, 17765000],
  ["4F-06", "4", "11.9 x 27.6", 323, 18572500],
  ["4F-07", "4", "11.9 x 27.6", 323, 18572500],
  ["4F-08", "4", "11.9 x 27.6", 323, 16150000],

  // ── 5th Floor ─────────────────────────────────────────────────────────────
  ["5F-01", "5", "11.9 x 27.6", 304, 15048000],
  ["5F-02", "5", "11.9 x 27.6", 323, 15261750],
  ["5F-03", "5", "11.9 x 27.6", 323, 15261750],
  ["5F-04", "5", "11.9 x 27.6", 323, 15261750],
  ["5F-05", "5", "11.9 x 27.6", 323, 15988500],
  ["5F-06", "5", "11.9 x 27.6", 323, 15261750],
  ["5F-07", "5", "11.9 x 27.6", 323, 15261750],
  ["5F-08", "5", "11.9 x 27.6", 323, 15261750],
];

// ─── INVESTOR DATA (unit numbers match ALL_UNITS exactly) ─────────────────────
interface Investor {
  name: string;
  cnic: string;
  unitNumber: string;
  totalAmount: number;
  downpayment: number;
  discount: number;
}

const INVESTORS: Investor[] = [
  { name: "Ms Toshiba Bano",          cnic: "45208-6524341-0", unitNumber: "G-01",   totalAmount: 48906000, downpayment: 12226500, discount: 1711710 },
  { name: "Ms Zahida Zia",            cnic: "N/A",             unitNumber: "1F-08",  totalAmount: 14625000, downpayment:  3000000, discount:  955800 },
  { name: "Ms Zahida Zia",            cnic: "N/A",             unitNumber: "1F-09",  totalAmount: 17235000, downpayment:        0, discount:       0 },
  { name: "Muhammad Jahanzeb Tariq",  cnic: "N/A",             unitNumber: "4F-01",  totalAmount: 15250000, downpayment:        0, discount:       0 },
  { name: "Muhammad Jahanzeb Tariq",  cnic: "N/A",             unitNumber: "4F-02",  totalAmount: 15250000, downpayment:        0, discount:       0 },
  { name: "Muhammad Jahanzeb Tariq",  cnic: "N/A",             unitNumber: "4F-05",  totalAmount: 15250000, downpayment:        0, discount:       0 },
  { name: "Muhammad Jahanzeb Tariq",  cnic: "N/A",             unitNumber: "4F-06",  totalAmount: 15250000, downpayment:        0, discount:       0 },
  { name: "Muhammad Osama Chaudhry",  cnic: "N/A",             unitNumber: "G-02",   totalAmount: 36250000, downpayment:  5000000, discount:       0 },
  { name: "Muhammad Hasham Chaudhry", cnic: "N/A",             unitNumber: "G-03",   totalAmount: 36250000, downpayment:        0, discount:       0 },
  { name: "Abdul Malik Khan",         cnic: "N/A",             unitNumber: "1F-02",  totalAmount: 14797350, downpayment:        0, discount:       0 },
  { name: "Muhammad Munir",           cnic: "N/A",             unitNumber: "2F-01",  totalAmount: 17480000, downpayment:  1000000, discount:       0 },
  { name: "Muhammad Munir",           cnic: "N/A",             unitNumber: "2F-02",  totalAmount: 15150000, downpayment:  1000000, discount:       0 },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("✔  Connected to MongoDB\n");

  const { Unit }          = await import("../src/lib/db/models/Unit");
  const { Owner }         = await import("../src/lib/db/models/Owner");
  const { Payment }       = await import("../src/lib/db/models/Payment");
  const { BookingRequest }= await import("../src/lib/db/models/BookingRequest");
  const { PaymentPlan }   = await import("../src/lib/db/models/PaymentPlan");

  // ── 1. Clear ────────────────────────────────────────────────────────────
  console.log("Clearing all collections…");
  const [pd, od, pyd, brd, upd] = await Promise.all([
    Payment.deleteMany({}),
    Owner.deleteMany({}),
    PaymentPlan.deleteMany({}),
    BookingRequest.deleteMany({}),
    Unit.deleteMany({}),
  ]);
  console.log(`  ✔  ${upd.deletedCount} units | ${od.deletedCount} owners | ${pyd.deletedCount} payments | ${brd.deletedCount} bookings | ${pd.deletedCount} payment plans deleted\n`);

  // ── 2. Seed PaymentPlan ─────────────────────────────────────────────────
  console.log("Seeding PaymentPlan (7 floors)…");
  for (const fp of PAYMENT_PLANS) {
    await PaymentPlan.create({
      floor: fp.floor,
      label: fp.label,
      rows: fp.rows.map(([shopNo, dimensions, totalArea, pricePerSqFt, unitPrice, downpayment, remaining, quarterlyInstalment, onPossession]) => ({
        shopNo, dimensions, totalArea, pricePerSqFt, unitPrice, downpayment, remaining, quarterlyInstalment, onPossession,
      })),
    });
    console.log(`  ✔  ${fp.label} (${fp.rows.length} display rows)`);
  }
  console.log();

  // ── 3. Seed Units ────────────────────────────────────────────────────────
  console.log(`Seeding ${ALL_UNITS.length} individual units…`);
  const bookedSet = new Set(INVESTORS.map((i) => i.unitNumber));

  for (const [unitNumber, floor, dimensions, size, price] of ALL_UNITS) {
    const status = bookedSet.has(unitNumber) ? "booked" : "available";
    await Unit.create({ unitNumber, floor, type: "shop", size, price, status });
  }

  const floorCounts: Record<string, number> = {};
  for (const [, floor] of ALL_UNITS) floorCounts[floor] = (floorCounts[floor] ?? 0) + 1;
  for (const [fl, cnt] of Object.entries(floorCounts)) {
    console.log(`  ✔  Floor ${fl}: ${cnt} units`);
  }
  console.log();

  // ── 4. Seed Owners + Payments ────────────────────────────────────────────
  console.log("Seeding Owners & Payments…");
  let ownersOk = 0, paymentsOk = 0, warnings = 0;

  for (const inv of INVESTORS) {
    const unit = await Unit.findOne({ unitNumber: inv.unitNumber });
    if (!unit) {
      console.warn(`  ⚠  Unit "${inv.unitNumber}" not found – skipping ${inv.name}`);
      warnings++;
      continue;
    }

    const regNo         = randomRegNo();
    const amountPaid    = inv.downpayment;
    const pendingAmount = Math.max(0, inv.totalAmount - amountPaid - inv.discount);

    const owner = await Owner.create({
      registrationNumber: regNo,
      ownerName:  inv.name,
      cnic:       inv.cnic,
      unitId:     unit._id,
      totalAmount: inv.totalAmount,
      amountPaid,
      pendingAmount,
    });
    ownersOk++;

    console.log(`  + ${inv.name.padEnd(32)} unit=${inv.unitNumber.padEnd(7)}  reg=${regNo}`);

    if (amountPaid > 0) {
      await Payment.create({
        ownerId:       owner._id,
        amount:        amountPaid,
        date:          new Date("2025-01-01"),
        paymentMethod: "bank_transfer",
        receiptNumber: `DP-${regNo}`,
        notes:         "Downpayment",
      });
      paymentsOk++;
    }
  }

  console.log(`\n  ✔  ${ownersOk} owners seeded`);
  console.log(`  ✔  ${paymentsOk} downpayment records seeded`);
  if (warnings) console.log(`  ⚠  ${warnings} warnings (check unit numbers above)`);

  console.log("\n══════════════════════════════════════════");
  console.log("  Reseed complete!");
  console.log("══════════════════════════════════════════\n");
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });

/**
 * Seed script: Parse 7Sky Investors.xlsx and populate MongoDB
 * Run: npx tsx scripts/seed-from-excel.ts
 * Or: MONGODB_URI=xxx npx tsx scripts/seed-from-excel.ts
 */

import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://capital:7skyQazMlp@cluster0.o4zgoea.mongodb.net/7sky";
const EXCEL_PATH = path.join(process.cwd(), "..", "7Sky Investors.xlsx");

async function seed() {
  await mongoose.connect(MONGODB_URI);

  const { User } = await import("../src/lib/db/models/User");
  const { Unit } = await import("../src/lib/db/models/Unit");
  const { Owner } = await import("../src/lib/db/models/Owner");
  const { Payment } = await import("../src/lib/db/models/Payment");

  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || "admin@7sky.com";
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@7sky123";

  const existingAdmin = await User.findOne({ email: seedAdminEmail });
  if (!existingAdmin) {
    const hash = await bcrypt.hash(seedAdminPassword, 10);
    await User.create({
      email: seedAdminEmail,
      passwordHash: hash,
      role: "super_admin",
      name: "Super Admin",
    });
    console.log("Created super admin:", seedAdminEmail);
  }

  if (!fs.existsSync(EXCEL_PATH)) {
    console.error("Excel file not found at", EXCEL_PATH);
    await mongoose.disconnect();
    process.exit(1);
  }

  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  }) as (string | number)[][];

  const dataStart = 4;
  const unitsMap = new Map<string, mongoose.Types.ObjectId>();

  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    const srNo = row[0];
    const nameVal = row[1];
    const cnicVal = row[2];
    const unitVal = row[3];
    const totalVal = row[4];
    const downpaymentVal = row[5];
    const discountVal = row[6];

    if (!unitVal || !nameVal) continue;

    const unitNumber = String(unitVal).trim();
    const ownerName = String(nameVal).trim();
    const cnic = cnicVal ? String(cnicVal).trim() : "N/A";
    const totalAmount = Number(totalVal) || 0;
    const downpayment = Number(downpaymentVal) || 0;
    const discount = Number(discountVal) || 0;

    if (!unitNumber || unitNumber.toLowerCase() === "unit") continue;

    let unit = await Unit.findOne({ unitNumber });
    if (!unit) {
      const floor = unitNumber.startsWith("G-")
        ? "GF"
        : unitNumber.startsWith("L")
          ? "LGF"
          : unitNumber.startsWith("2nd")
            ? "2"
            : unitNumber.startsWith("4th")
              ? "4"
              : unitNumber.startsWith("F-")
                ? "1"
                : "1";
      unit = await Unit.create({
        unitNumber,
        floor,
        type: "shop",
        size: 500,
        price: totalAmount,
        status: "booked",
      });
      unitsMap.set(unitNumber, unit._id);
    }

    const registrationNumber = `7SKY-${String(srNo).padStart(6, "0")}`;
    const pendingAmount = Math.max(0, totalAmount - downpayment - discount);

    const existingOwner = await Owner.findOne({ registrationNumber });
    if (!existingOwner) {
      const owner = await Owner.create({
        registrationNumber,
        ownerName,
        cnic,
        unitId: unit._id,
        totalAmount,
        amountPaid: downpayment,
        pendingAmount,
      });

      if (downpayment > 0) {
        await Payment.create({
          ownerId: owner._id,
          amount: downpayment,
          date: new Date(),
          paymentMethod: "bank_transfer",
          receiptNumber: `REG-${registrationNumber}`,
        });
      }
    }
  }

  console.log(`Seeded from Excel. Units: ${unitsMap.size}, processed ${rows.length - dataStart} rows.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

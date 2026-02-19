/**
 * Seed inventory from Project 19-A Feasibility.xlsx
 * Run: npx tsx scripts/seed-feasibility.ts
 *
 * Uses the "Shop Details" sheet which consolidates all floors.
 * Columns: Floor | Shop Number | Shop Size (sqft) | Price/Sqft | Total Price | Downpayment | Remaining | Monthly Instalment
 *
 * Skips units already in the database (upserts by unitNumber).
 */

import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";
import mongoose from "mongoose";
// Load .env.local manually (no dotenv dependency needed)
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://capital:7skyQazMlp@cluster0.o4zgoea.mongodb.net/7sky";

const EXCEL_PATH = path.join(__dirname, "..", "..", "Project 19-A Feasibility.xlsx");

// Map floor labels in the Excel → our floor IDs
function normaliseFloor(raw: string): string {
  const s = String(raw).trim().toLowerCase();
  if (s.includes("basement") || s.includes("lower")) return "LGF";
  if (s.includes("ground")) return "GF";
  if (s.includes("mezzanine") || s === "m") return "M";
  if (s.includes("1st") || s === "1f") return "1";
  if (s.includes("2nd") || s === "2f") return "2";
  if (s.includes("3rd") || s === "3f") return "3";
  if (s.includes("4th") || s === "4f") return "4";
  if (s.includes("5th") || s === "5f") return "5";
  return s;
}

// Derive floor from shop number prefix as fallback
function floorFromShopNo(shopNo: string): string {
  const s = String(shopNo).trim().toUpperCase();
  if (s.startsWith("LG-") || s.startsWith("LGF")) return "LGF";
  if (s.startsWith("G-"))  return "GF";
  if (s.startsWith("MF-") || s.startsWith("M-")) return "M";
  if (s.startsWith("1F-")) return "1";
  if (s.startsWith("2F-")) return "2";
  if (s.startsWith("3F-")) return "3";
  if (s.startsWith("4F-")) return "4";
  if (s.startsWith("5F-")) return "5";
  return "1";
}

async function seed() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error("Excel file not found at:", EXCEL_PATH);
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const { Unit } = await import("../src/lib/db/models/Unit");

  const workbook = XLSX.readFile(EXCEL_PATH);

  // Try "Shop Details" sheet first, fall back to first sheet
  const sheetName = workbook.SheetNames.includes("Shop Details")
    ? "Shop Details"
    : workbook.SheetNames[0];
  console.log(`Using sheet: "${sheetName}"`);

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  }) as (string | number)[][];

  // Row 0 is the header
  console.log("Header row:", JSON.stringify(rows[0]));
  console.log(`Total data rows: ${rows.length - 1}`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === "" || c == null)) continue;

    const floorRaw  = String(row[0] ?? "").trim();
    const shopNoRaw = String(row[1] ?? "").trim();
    const sizeRaw   = Number(row[2]) || 0;
    const pricePerSqFt = Number(row[3]) || 0;
    const totalPrice   = Number(row[4]) || 0;

    if (!shopNoRaw || shopNoRaw.toLowerCase() === "shop number") continue;
    if (!totalPrice && !sizeRaw) continue; // completely empty row

    const unitNumber = shopNoRaw.toUpperCase().replace(/\s+/g, "-");
    const floor = floorRaw ? normaliseFloor(floorRaw) : floorFromShopNo(unitNumber);
    const price = totalPrice || sizeRaw * pricePerSqFt;

    try {
      const result = await Unit.findOneAndUpdate(
        { unitNumber },
        {
          $setOnInsert: {
            unitNumber,
            floor,
            type: "shop",
            size: sizeRaw,
            price,
            status: "available",
          },
        },
        { upsert: true, new: false }
      );

      if (result === null) {
        inserted++;
        if (inserted <= 5) {
          console.log(`  + Inserted: ${unitNumber} | Floor: ${floor} | Size: ${sizeRaw} sqft | Price: Rs. ${price.toLocaleString()}`);
        }
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`  ! Error on row ${i} (${unitNumber}):`, (err as Error).message);
      errors++;
    }
  }

  console.log(`\nDone!`);
  console.log(`  Inserted : ${inserted} new units`);
  console.log(`  Skipped  : ${skipped} already existed`);
  console.log(`  Errors   : ${errors}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { existsSync, readFileSync } from "fs";
import path from "path";
import { FLOOR_IDS, uploadFloorPlanImage, type FloorId } from "../src/lib/cloudinary";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;
    process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

const FLOOR_LABELS: Record<FloorId, string> = {
  LGF: "Lower Ground Floor",
  GF: "Ground Floor",
  "1": "1st Floor",
  "2": "2nd Floor",
  "3": "3rd Floor",
  "4": "4th Floor",
  "5": "5th Floor",
};

const LOCAL_IMAGE_MAP: Record<FloorId, string> = {
  LGF: "lgf.png",
  GF: "gf.png",
  "1": "1f.png",
  "2": "2f-3f.png",
  "3": "3f.png",
  "4": "4f.png",
  "5": "5f.png",
};

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

async function main() {
  loadEnv();
  const { default: dbConnect } = await import("../src/lib/db/connection");
  const { PaymentPlan } = await import("../src/lib/db/models");
  await dbConnect();

  const baseDir = path.join(process.cwd(), "public", "media", "floor-plans");
  console.log("Uploading local floor plans to Cloudinary...");

  for (const floor of FLOOR_IDS) {
    const filename = LOCAL_IMAGE_MAP[floor];
    const filepath = path.join(baseDir, filename);
    if (!existsSync(filepath)) {
      console.warn(`- Skipped ${floor}: local file not found (${filename})`);
      continue;
    }

    const ext = path.extname(filename).toLowerCase();
    const mime = MIME_BY_EXT[ext];
    if (!mime) {
      console.warn(`- Skipped ${floor}: unsupported extension ${ext}`);
      continue;
    }

    const fileBuffer = readFileSync(filepath);
    const upload = await uploadFloorPlanImage(fileBuffer, floor, mime);

    await PaymentPlan.findOneAndUpdate(
      { floor },
      {
        floor,
        label: FLOOR_LABELS[floor],
        floorImageUrl: upload.secureUrl,
        floorImagePublicId: upload.publicId,
      },
      { upsert: true, new: true }
    );

    console.log(`- ${floor}: uploaded (${upload.publicId})`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Floor image seed failed:", err);
  process.exit(1);
});

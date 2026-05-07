import { v2 as cloudinary } from "cloudinary";

let configured = false;
export const FLOOR_IDS = ["LGF", "GF", "1", "2", "3", "4", "5"] as const;
export type FloorId = (typeof FLOOR_IDS)[number];

function ensureCloudinaryConfigured() {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary env vars are missing.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  configured = true;
}

export async function uploadOwnerPhoto(fileBuffer: Buffer, ownerId: string, mimeType: string) {
  ensureCloudinaryConfigured();
  const base64 = fileBuffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64}`;

  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder: "7sky/owners",
    public_id: `owner-${ownerId}-${Date.now()}`,
    resource_type: "image",
    overwrite: true,
  });

  return {
    secureUrl: uploaded.secure_url,
    publicId: uploaded.public_id,
  };
}

export async function deleteOwnerPhoto(publicId?: string) {
  if (!publicId) return;
  ensureCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export async function uploadFloorPlanImage(fileBuffer: Buffer, floor: FloorId, mimeType: string) {
  ensureCloudinaryConfigured();
  const base64 = fileBuffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64}`;

  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder: "7sky/floor-plans",
    public_id: `floor-${floor}`,
    resource_type: "image",
    overwrite: true,
  });

  return {
    secureUrl: uploaded.secure_url,
    publicId: uploaded.public_id,
  };
}

export async function deleteFloorPlanImage(publicId?: string) {
  if (!publicId) return;
  ensureCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

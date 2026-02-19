import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type MediaType = "image" | "video" | "pdf";
export type MediaCategory = "floorplan" | "paymentplan" | "gallery";

export interface IMedia extends Document {
  type: MediaType;
  category: MediaCategory;
  url: string;
  filename: string;
  metadata?: Record<string, unknown>;
  uploadedBy?: Types.ObjectId;
  createdAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    type: { type: String, enum: ["image", "video", "pdf"], required: true },
    category: {
      type: String,
      enum: ["floorplan", "paymentplan", "gallery"],
      required: true,
    },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

MediaSchema.index({ category: 1 });
MediaSchema.index({ type: 1 });

export const Media: Model<IMedia> =
  mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type BookingStatus = "pending" | "approved" | "rejected" | "reserved";

export interface IBookingRequest extends Document {
  name: string;
  phone: string;
  email?: string;
  unitId: Types.ObjectId;
  message?: string;
  status: BookingStatus;
  createdAt: Date;
}

const BookingRequestSchema = new Schema<IBookingRequest>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    unitId: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
    message: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected", "reserved"], default: "pending" },
  },
  { timestamps: true }
);

BookingRequestSchema.index({ status: 1 });
BookingRequestSchema.index({ createdAt: -1 });

export const BookingRequest: Model<IBookingRequest> =
  mongoose.models.BookingRequest ||
  mongoose.model<IBookingRequest>("BookingRequest", BookingRequestSchema);

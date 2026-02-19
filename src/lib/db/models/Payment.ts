import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPayment extends Document {
  ownerId: Types.ObjectId;
  amount: number;
  date: Date;
  paymentMethod: string;
  receiptNumber?: string;
  notes?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    paymentMethod: { type: String, required: true },
    receiptNumber: { type: String },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PaymentSchema.index({ ownerId: 1 });
PaymentSchema.index({ date: -1 });

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

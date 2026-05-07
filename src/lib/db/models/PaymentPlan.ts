import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPaymentPlanRow {
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

export interface IPaymentPlan extends Document {
  floor: "LGF" | "GF" | "1" | "2" | "3" | "4" | "5";
  label: string;
  rows: IPaymentPlanRow[];
  floorImageUrl?: string;
  floorImagePublicId?: string;
  updatedAt: Date;
}

const PaymentPlanRowSchema = new Schema<IPaymentPlanRow>(
  {
    shopNo: { type: String, required: true },
    dimensions: { type: String, default: "" },
    totalArea: { type: Number, default: 0 },
    pricePerSqFt: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    downpayment: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    quarterlyInstalment: { type: Number, default: 0 },
    onPossession: { type: Number, default: 0 },
  },
  { _id: false }
);

const PaymentPlanSchema = new Schema<IPaymentPlan>(
  {
    floor: {
      type: String,
      enum: ["LGF", "GF", "1", "2", "3", "4", "5"],
      required: true,
      unique: true,
    },
    label: { type: String, required: true },
    rows: { type: [PaymentPlanRowSchema], default: [] },
    floorImageUrl: { type: String },
    floorImagePublicId: { type: String },
  },
  { timestamps: true }
);

export const PaymentPlan: Model<IPaymentPlan> =
  mongoose.models.PaymentPlan ||
  mongoose.model<IPaymentPlan>("PaymentPlan", PaymentPlanSchema);

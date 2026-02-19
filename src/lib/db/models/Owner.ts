import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITransferRecord {
  previousOwnerName: string;
  previousCnic: string;
  previousPhone: string;
  transferNote: string;
  transferredAt: Date;
}

export interface IOwner extends Document {
  registrationNumber: string;
  ownerName: string;
  cnic: string;
  phone?: string;
  unitId: Types.ObjectId;
  totalAmount: number;
  discount: number;
  amountPaid: number;
  pendingAmount: number;
  transferHistory: ITransferRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const TransferRecordSchema = new Schema<ITransferRecord>(
  {
    previousOwnerName: { type: String, required: true },
    previousCnic: { type: String, required: true },
    previousPhone: { type: String, default: "" },
    transferNote: { type: String, default: "" },
    transferredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OwnerSchema = new Schema<IOwner>(
  {
    registrationNumber: { type: String, required: true, unique: true },
    ownerName: { type: String, required: true },
    cnic: { type: String, required: true },
    phone: { type: String },
    unitId: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    transferHistory: { type: [TransferRecordSchema], default: [] },
  },
  { timestamps: true }
);

OwnerSchema.index({ registrationNumber: 1 }, { unique: true });
OwnerSchema.index({ unitId: 1 });

delete mongoose.models.Owner;
export const Owner: Model<IOwner> = mongoose.model<IOwner>("Owner", OwnerSchema);

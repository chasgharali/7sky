import mongoose, { Schema, Document, Model } from "mongoose";

export type UnitFloor = "LGF" | "GF" | "1" | "2" | "3" | "4" | "5";
export type UnitType = "shop" | "office";
export type UnitStatus = "available" | "booked" | "reserved";

export interface IUnit extends Document {
  unitNumber: string;
  floor: UnitFloor;
  type: UnitType;
  size: number;
  price: number;
  status: UnitStatus;
  overlay?: {
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
  };
}

const UnitSchema = new Schema<IUnit>(
  {
    unitNumber: { type: String, required: true, unique: true },
    floor: { type: String, enum: ["LGF", "GF", "1", "2", "3", "4", "5"], required: true },
    type: { type: String, enum: ["shop", "office"], required: true },
    size: { type: Number, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "booked", "reserved"],
      default: "available",
    },
    overlay: {
      xPercent: Number,
      yPercent: Number,
      widthPercent: Number,
      heightPercent: Number,
    },
  },
  { timestamps: true }
);

UnitSchema.index({ floor: 1, status: 1 });

export const Unit: Model<IUnit> =
  mongoose.models.Unit || mongoose.model<IUnit>("Unit", UnitSchema);

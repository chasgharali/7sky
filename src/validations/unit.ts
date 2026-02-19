import { z } from "zod";

export const unitSchema = z.object({
  unitNumber: z.string().min(1).max(20),
  floor: z.enum(["LGF", "GF", "1", "2", "3", "4", "5"]),
  type: z.enum(["shop", "office"]),
  size: z.number().positive(),
  price: z.number().nonnegative(),
  status: z.enum(["available", "booked", "reserved"]),
});

export const unitUpdateSchema = unitSchema.partial();

export type UnitInput = z.infer<typeof unitSchema>;

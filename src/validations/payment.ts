import { z } from "zod";

export const paymentSchema = z.object({
  ownerId: z.string().min(1),
  amount: z.number().positive(),
  date: z.coerce.date().optional(),
  paymentMethod: z.string().min(1).max(50),
  receiptNumber: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

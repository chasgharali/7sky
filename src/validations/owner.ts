import { z } from "zod";

export const ownerSchema = z.object({
  registrationNumber: z.string().min(1).max(50).optional(),
  ownerName: z.string().min(1).max(100),
  cnic: z.string().min(1).max(20),
  phone: z.string().max(20).optional(),
  unitId: z.string().min(1),
  totalAmount: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  amountPaid: z.number().nonnegative().default(0),
  pendingAmount: z.number().nonnegative().default(0),
});

export type OwnerInput = z.infer<typeof ownerSchema>;

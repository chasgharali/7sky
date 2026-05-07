import { z } from "zod";

export const ownerSchema = z.object({
  registrationNumber: z.string().min(1).max(50).optional(),
  ownerName: z.string().min(1),
  cnic: z.string().min(1),
  phone: z.string().optional(),
  residentOf: z.string().optional(),
  photoUrl: z.string().url().optional(),
  photoPublicId: z.string().min(1).optional(),
  verificationToken: z.string().min(10).optional(),
  unitId: z.string().min(1),
  totalAmount: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  amountPaid: z.number().nonnegative().default(0),
  pendingAmount: z.number().nonnegative().default(0),
});

export type OwnerInput = z.infer<typeof ownerSchema>;

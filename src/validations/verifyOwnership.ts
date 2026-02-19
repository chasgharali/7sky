import { z } from "zod";

export const verifyOwnershipSchema = z.object({
  registrationNumber: z
    .string()
    .min(1, "Registration number required")
    .max(50, "Invalid registration number")
    .regex(/^[A-Za-z0-9\-]+$/, "Invalid characters"),
});

export type VerifyOwnershipInput = z.infer<typeof verifyOwnershipSchema>;

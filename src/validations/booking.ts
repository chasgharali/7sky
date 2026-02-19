import { z } from "zod";

export const bookingRequestSchema = z.object({
  name: z.string().min(1, "Name required").max(100),
  phone: z.string().min(1, "Phone required").max(20),
  email: z.string().email().optional().or(z.literal("")),
  unitId: z.string().min(1, "Unit required"),
  message: z.string().max(500).optional(),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

import { z } from "zod";
import { decimalString } from "./decimal";

// docs/API Specification.md sections 50-52.
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const paymentSchema = z.object({
  amount: decimalString({ label: "Amount", min: 0.01 }),
  paymentDate: z
    .string()
    .trim()
    .regex(DATE_PATTERN, "Payment date must be in YYYY-MM-DD format")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

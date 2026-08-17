import { z } from "zod";
import { decimalString, optionalDecimalString } from "./decimal";

// docs/API Specification.md sections 32, 34. Shared by Quote and Invoice item
// schemas — both documents have an identical item shape
// (name/description/unit/quantity/unitPrice/discountAmount/taxRate, optional
// productId). Quantity/unitPrice/discountAmount/taxRate are exactly what the user
// enters for this document (not necessarily copied from a Product — items may be
// manually entered, or a Product's values overridden). The server never accepts
// client-computed taxAmount/lineTotal/subtotal/totalAmount — those are always
// derived server-side via lib/document-calculation.ts.

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

export const documentItemSchema = z.object({
  productId: z.string().trim().uuid().optional().nullable(),
  name: z.string().trim().min(1, "Item name is required").max(200),
  description: optionalString(2000),
  unit: z.string().trim().min(1, "Unit is required").max(50),
  sacCode: optionalString(50),
  quantity: decimalString({ label: "Quantity", maxDecimalPlaces: 3, min: 0.001 }),
  unitPrice: decimalString({ label: "Unit price", min: 0 }),
  discountAmount: optionalDecimalString({ label: "Discount", min: 0, defaultValue: "0.00" }),
  taxRate: optionalDecimalString({ label: "Tax rate", min: 0, max: 100, defaultValue: "0.00" }),
});

export type DocumentItemInput = z.infer<typeof documentItemSchema>;

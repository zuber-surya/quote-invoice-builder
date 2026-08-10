import { z } from "zod";
import { decimalString, optionalDecimalString } from "./decimal";

// docs/API Specification.md sections 32, 34. docs/Product Requirements Document.md
// section 14. Item-level quantity/unitPrice/discountAmount/taxRate are exactly what
// the user enters for this quote (not necessarily copied from a Product — items may
// be manually entered, or a Product's values overridden for this quote). The server
// never accepts client-computed taxAmount/lineTotal/subtotal/totalAmount — those are
// always derived server-side via lib/quote-calculation.ts.

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const dateString = (label: string) => z.string().trim().regex(DATE_PATTERN, `${label} must be in YYYY-MM-DD format`);

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

export const quoteItemSchema = z.object({
  productId: z.string().trim().uuid().optional().nullable(),
  name: z.string().trim().min(1, "Item name is required").max(200),
  description: optionalString(2000),
  unit: z.string().trim().min(1, "Unit is required").max(50),
  quantity: decimalString({ label: "Quantity", maxDecimalPlaces: 3, min: 0.001 }),
  unitPrice: decimalString({ label: "Unit price", min: 0 }),
  discountAmount: optionalDecimalString({ label: "Discount", min: 0, defaultValue: "0.00" }),
  taxRate: optionalDecimalString({ label: "Tax rate", min: 0, max: 100, defaultValue: "0.00" }),
});

export type QuoteItemInput = z.infer<typeof quoteItemSchema>;

export const quoteSchema = z.object({
  customerId: z.string().trim().uuid("Select a customer"),
  quoteDate: dateString("Quote date"),
  expiryDate: dateString("Expiry date").optional().or(z.literal("")).transform((value) => (value ? value : null)),
  items: z.array(quoteItemSchema).min(1, "Add at least one item"),
  notes: optionalString(2000),
  terms: optionalString(2000),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

// PUT allows the same shape as create — full replace of header + items, only
// reachable while the quote is still DRAFT (enforced in the route, not here).
export const quoteUpdateSchema = quoteSchema;

// docs/API Specification.md section 37.
export const quoteStatusSchema = z.object({
  status: z.enum(["SENT", "ACCEPTED", "REJECTED", "EXPIRED"]),
});

// docs/API Specification.md section 12/29 — list query params.
export const quoteListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]).optional(),
  customerId: z.string().trim().uuid().optional(),
  dateFrom: dateString("Date from").optional(),
  dateTo: dateString("Date to").optional(),
  sortBy: z.enum(["quoteDate", "createdAt", "totalAmount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type QuoteListQuery = z.infer<typeof quoteListQuerySchema>;

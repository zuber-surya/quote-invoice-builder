import { z } from "zod";
import { documentItemSchema } from "./document-item";

// docs/API Specification.md sections 32, 34. docs/Product Requirements Document.md
// section 14. Item schema lives in ./document-item.ts — shared with Invoices. The
// server never accepts client-computed taxAmount/lineTotal/subtotal/totalAmount —
// those are always derived server-side via lib/document-calculation.ts.

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

export const quoteSchema = z.object({
  customerId: z.string().trim().uuid("Select a customer"),
  quoteDate: dateString("Quote date"),
  expiryDate: dateString("Expiry date").optional().or(z.literal("")).transform((value) => (value ? value : null)),
  items: z.array(documentItemSchema).min(1, "Add at least one item"),
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

import { z } from "zod";
import { documentItemSchema } from "./document-item";

// docs/API Specification.md sections 43-49. docs/Product Requirements Document.md
// section 20. Same shape as quotes (lib/validations/quote.ts) with dueDate instead
// of expiryDate. The server never accepts client-computed totals — see
// lib/document-calculation.ts.

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

export const invoiceSchema = z.object({
  customerId: z.string().trim().uuid("Select a customer"),
  invoiceDate: dateString("Invoice date"),
  dueDate: dateString("Due date").optional().or(z.literal("")).transform((value) => (value ? value : null)),
  items: z.array(documentItemSchema).min(1, "Add at least one item"),
  notes: optionalString(2000),
  terms: optionalString(2000),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

// PUT allows the same shape as create — full replace of header + items, only
// reachable while the invoice is still DRAFT (enforced in the route, not here).
export const invoiceUpdateSchema = invoiceSchema;

// docs/Database Design Document.md section 19 — no OVERDUE stored, it's derived
// dynamically from dueDate/paidAmount rather than persisted.
export const invoiceListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: z.enum(["DRAFT", "UNPAID", "PARTIALLY_PAID", "PAID"]).optional(),
  customerId: z.string().trim().uuid().optional(),
  dateFrom: dateString("Date from").optional(),
  dateTo: dateString("Date to").optional(),
  sortBy: z.enum(["invoiceDate", "createdAt", "totalAmount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type InvoiceListQuery = z.infer<typeof invoiceListQuerySchema>;

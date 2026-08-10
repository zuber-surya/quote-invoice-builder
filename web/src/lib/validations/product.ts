import { z } from "zod";
import { decimalString, optionalDecimalString } from "./decimal";

// docs/Product Requirements Document.md section 11 — name, unit, price required.
// docs/API Specification.md section 65 — money fields travel as decimal strings to
// avoid JS floating-point precision issues; the raw string is passed through to
// Prisma's Decimal columns untouched.
const priceString = decimalString({ label: "Price", min: 0 });
const taxRateString = optionalDecimalString({ label: "Tax rate", min: 0, max: 100, defaultValue: "0.00" });

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200),
  description: optionalString(2000),
  unit: z.string().trim().min(1, "Unit is required").max(50),
  price: priceString,
  taxRate: taxRateString,
});

export type ProductInput = z.infer<typeof productSchema>;

// docs/API Specification.md section 12 — list query params.
export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

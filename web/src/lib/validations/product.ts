import { z } from "zod";

// docs/Product Requirements Document.md section 11 — name, unit, price required.
// docs/API Specification.md section 65 — money fields travel as decimal strings to
// avoid JS floating-point precision issues; the raw string is passed through to
// Prisma's Decimal columns untouched. Range checks use parseFloat only for bounds,
// never to reconstruct the stored value.
const DECIMAL_PATTERN = /^\d+(\.\d{1,2})?$/;

const priceString = z
  .string()
  .trim()
  .regex(DECIMAL_PATTERN, "Enter a valid amount with up to 2 decimal places")
  .refine((value) => parseFloat(value) >= 0, "Price must be 0 or greater");

const taxRateString = z
  .string()
  .trim()
  .regex(DECIMAL_PATTERN, "Enter a valid percentage with up to 2 decimal places")
  .refine((value) => {
    const num = parseFloat(value);
    return num >= 0 && num <= 100;
  }, "Tax rate must be between 0 and 100")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : "0.00"));

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

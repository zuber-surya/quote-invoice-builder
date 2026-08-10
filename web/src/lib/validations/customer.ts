import { z } from "zod";

// docs/Product Requirements Document.md section 10 — only `name` is required.
// Empty strings from optional form fields are stored as null, not "".
const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(255)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : null))
  .refine((value) => value === null || z.string().email().safeParse(value).success, {
    message: "Enter a valid email address",
  });

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required").max(200),
  companyName: optionalString(200),
  email: optionalEmail,
  phone: optionalString(30),
  address: optionalString(1000),
  city: optionalString(100),
  state: optionalString(100),
  country: optionalString(100),
  postalCode: optionalString(20),
  taxNumber: optionalString(100),
  notes: optionalString(2000),
});

export type CustomerInput = z.infer<typeof customerSchema>;

// docs/API Specification.md section 12 — list query params.
export const customerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;

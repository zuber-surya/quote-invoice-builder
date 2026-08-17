import { z } from "zod";

// Empty strings from optional form fields should be stored as null, not "".
const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

const optionalUrl = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null))
    .refine((value) => value === null || /^https?:\/\//i.test(value), {
      message: "Enter a full URL starting with http:// or https://",
    });

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

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const optionalDateString = (label: string) =>
  z
    .string()
    .trim()
    .regex(DATE_PATTERN, `${label} must be in YYYY-MM-DD format`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

export const businessProfileSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required").max(200),
  logoUrl: optionalUrl(2048),
  ownerName: optionalString(150),
  email: optionalEmail,
  phone: optionalString(30),
  address: optionalString(1000),
  city: optionalString(100),
  state: optionalString(100),
  country: optionalString(100),
  postalCode: optionalString(20),
  taxNumber: optionalString(100),
  website: optionalUrl(255),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, "Currency must be a 3-letter ISO code")
    .default("INR"),

  bankAccountName: optionalString(150),
  bankName: optionalString(150),
  bankAccountNumber: optionalString(50),
  ifscCode: optionalString(20),
  swiftBicCode: optionalString(20),
  lutNumber: optionalString(50),
  lutDate: optionalDateString("LUT date"),

  pdfShowQuantity: z.boolean().default(true),
  pdfShowUnitPrice: z.boolean().default(true),
  pdfShowDiscount: z.boolean().default(true),
  pdfShowTax: z.boolean().default(true),
  pdfShowSacCode: z.boolean().default(false),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;

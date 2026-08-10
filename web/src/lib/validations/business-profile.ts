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
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;

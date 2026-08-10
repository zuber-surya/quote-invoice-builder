import { z } from "zod";

// Shared decimal-string validation for monetary and quantity fields — see
// docs/API Specification.md section 65 (money as strings, never floating point)
// and CLAUDE.md's Financial Rules. Originated in product.ts; also used by quote
// (and later invoice) item schemas, which is why it's centralized here rather
// than duplicated per schema.

function decimalPattern(maxDecimalPlaces: number) {
  return new RegExp(`^\\d+(\\.\\d{1,${maxDecimalPlaces}})?$`);
}

export function decimalString(opts: {
  label: string;
  maxDecimalPlaces?: number;
  min?: number;
  max?: number;
}) {
  const { label, maxDecimalPlaces = 2, min, max } = opts;

  return z
    .string()
    .trim()
    .regex(decimalPattern(maxDecimalPlaces), `Enter a valid ${label} with up to ${maxDecimalPlaces} decimal place(s)`)
    .refine((value) => {
      const num = parseFloat(value);
      if (min !== undefined && num < min) return false;
      if (max !== undefined && num > max) return false;
      return true;
    }, rangeMessage(label, min, max));
}

export function optionalDecimalString(opts: {
  label: string;
  maxDecimalPlaces?: number;
  min?: number;
  max?: number;
  defaultValue: string;
}) {
  return decimalString(opts)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : opts.defaultValue));
}

function rangeMessage(label: string, min?: number, max?: number): string {
  if (min !== undefined && max !== undefined) return `${label} must be between ${min} and ${max}`;
  if (min !== undefined) return `${label} must be ${min} or greater`;
  if (max !== undefined) return `${label} must be ${max} or less`;
  return `${label} is invalid`;
}

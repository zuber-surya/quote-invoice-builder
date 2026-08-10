import { Prisma } from "@prisma/client";

// Prisma's Decimal.toString() / toJSON() strips trailing zeros (25000.00 -> "25000"),
// which breaks the API Specification's "money as 2-decimal strings" contract (section 65)
// and the DB's NUMERIC(15,2)/NUMERIC(5,2) precision. Always format explicitly.
export function formatDecimal(value: Prisma.Decimal | string | number): string {
  return new Prisma.Decimal(value).toFixed(2);
}

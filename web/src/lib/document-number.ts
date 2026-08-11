// docs/Database Design Document.md section 14 — sequential per-user document numbers
// (Q-00001, INV-00001, ...), unique per (userId, number). Concurrency safety
// (section 54 DoD) comes from that unique constraint, not from locking: the caller
// creates the document inside a transaction using the number returned here, and on
// a unique-constraint conflict (two concurrent requests computing the same next
// number) retries with a freshly recomputed number. See POST /api/v1/quotes and
// POST /api/v1/invoices.
//
// Shared by Quotes and Invoices — the numbering scheme is identical (only the
// prefix differs), so the caller fetches the last document's number (scoped to
// the correct model — Quote vs Invoice — and ordered by createdAt desc) and passes
// it in here as a plain string, keeping this function free of any Prisma delegate
// typing.

const PAD_WIDTH = 5;

export function getNextDocumentNumber(lastNumber: string | null, prefix: string): string {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  const lastSeq = lastNumber ? parseInt(lastNumber.match(pattern)?.[1] ?? "0", 10) : 0;
  const nextSeq = lastSeq + 1;

  return `${prefix}-${String(nextSeq).padStart(PAD_WIDTH, "0")}`;
}

// Prisma's unique-constraint violation code.
export const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

import type { Prisma, PrismaClient } from "@prisma/client";

// docs/Database Design Document.md section 14 — sequential per-user quote numbers
// (Q-00001, Q-00002, ...), unique per (userId, quoteNumber). Concurrency safety
// (section 54 DoD) comes from that unique constraint, not from locking: the caller
// creates the quote inside a transaction using the number returned here, and on a
// unique-constraint conflict (two concurrent requests computing the same next
// number) retries with a freshly recomputed number. See POST /api/v1/quotes.

const QUOTE_NUMBER_PATTERN = /^Q-(\d+)$/;
const PAD_WIDTH = 5;

type PrismaLike = PrismaClient | Prisma.TransactionClient;

export async function getNextQuoteNumber(db: PrismaLike, userId: string): Promise<string> {
  const last = await db.quote.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { quoteNumber: true },
  });

  const lastSeq = last ? parseInt(last.quoteNumber.match(QUOTE_NUMBER_PATTERN)?.[1] ?? "0", 10) : 0;
  const nextSeq = lastSeq + 1;

  return `Q-${String(nextSeq).padStart(PAD_WIDTH, "0")}`;
}

// Prisma's unique-constraint violation code.
export const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

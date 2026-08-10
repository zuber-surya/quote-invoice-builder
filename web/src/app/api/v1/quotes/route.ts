import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiSuccess, apiUnauthorized, apiValidationError, apiInternalError } from "@/lib/api-response";
import { quoteSchema, quoteListQuerySchema } from "@/lib/validations/quote";
import { calculateQuoteTotals } from "@/lib/quote-calculation";
import { getNextQuoteNumber, UNIQUE_CONSTRAINT_ERROR_CODE } from "@/lib/quote-number";
import { serializeQuote } from "@/lib/serialize-quote";
import { validateQuoteReferences } from "@/lib/quote-ownership";

// docs/API Specification.md sections 29-30, 32-34.
// Ownership: every query is scoped by the authenticated user's id (CLAUDE.md rule 11).
// Financial totals are always server-calculated (CLAUDE.md rule 10) — the client
// never supplies subtotal/taxAmount/totalAmount/lineTotal, only the raw item inputs.

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const parsed = quoteListQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }
  const { page, pageSize, search, status, customerId, dateFrom, dateTo, sortBy, sortOrder } = parsed.data;

  const where: Prisma.QuoteWhereInput = {
    userId: user.id,
    ...(status ? { status } : {}),
    ...(customerId ? { customerId } : {}),
    ...(dateFrom || dateTo
      ? { quoteDate: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), ...(dateTo ? { lte: new Date(dateTo) } : {}) } }
      : {}),
    ...(search
      ? {
          OR: [
            { quoteNumber: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  try {
    const [quotes, total] = await prisma.$transaction([
      prisma.quote.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { customer: { select: { id: true, name: true, companyName: true, email: true } } },
      }),
      prisma.quote.count({ where }),
    ]);

    return apiSuccess(
      quotes.map((quote) => serializeQuote(quote)),
      { meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } }
    );
  } catch (error) {
    console.error("Failed to list quotes:", error);
    return apiInternalError();
  }
}

const MAX_QUOTE_NUMBER_ATTEMPTS = 5;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }
  const input = parsed.data;

  const references = await validateQuoteReferences(user.id, input.customerId, input.items);
  if (!references.ok) return references.error;

  const { items: calculatedItems, totals } = calculateQuoteTotals(
    input.items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountAmount: item.discountAmount,
      taxRate: item.taxRate,
    }))
  );

  for (let attempt = 1; attempt <= MAX_QUOTE_NUMBER_ATTEMPTS; attempt++) {
    try {
      const quote = await prisma.$transaction(async (tx) => {
        const quoteNumber = await getNextQuoteNumber(tx, user.id);

        return tx.quote.create({
          data: {
            userId: user.id,
            customerId: input.customerId,
            quoteNumber,
            quoteDate: new Date(input.quoteDate),
            expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
            status: "DRAFT",
            subtotal: totals.subtotal,
            discountAmount: totals.discountAmount,
            taxAmount: totals.taxAmount,
            totalAmount: totals.totalAmount,
            notes: input.notes,
            terms: input.terms,
            items: {
              create: calculatedItems.map((item, index) => ({
                productId: input.items[index].productId ?? null,
                name: input.items[index].name,
                description: input.items[index].description,
                unit: input.items[index].unit,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountAmount: item.discountAmount,
                taxRate: item.taxRate,
                taxAmount: item.taxAmount,
                lineTotal: item.lineTotal,
                sortOrder: index,
              })),
            },
          },
          include: { items: true, customer: { select: { id: true, name: true, companyName: true, email: true } } },
        });
      });

      return apiSuccess(serializeQuote(quote), { status: 201 });
    } catch (error) {
      // The only unique constraint a quote create can hit is (userId, quoteNumber) —
      // id is an auto-generated uuid. A P2002 here means a concurrent request took
      // the number we just computed; recompute and retry.
      const isQuoteNumberConflict =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_ERROR_CODE;

      if (isQuoteNumberConflict && attempt < MAX_QUOTE_NUMBER_ATTEMPTS) {
        continue;
      }

      console.error("Failed to create quote:", error);
      return apiInternalError();
    }
  }

  return apiInternalError();
}

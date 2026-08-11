import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiSuccess, apiError, apiUnauthorized, apiInternalError } from "@/lib/api-response";
import { calculateDocumentTotals } from "@/lib/document-calculation";
import { getNextDocumentNumber, UNIQUE_CONSTRAINT_ERROR_CODE } from "@/lib/document-number";
import { formatDecimal } from "@/lib/format-decimal";
import { serializeInvoice } from "@/lib/serialize-invoice";

// docs/API Specification.md sections 41-42. docs/Database Design Document.md section 24.
// Quote Conversion Rules: verify ownership, verify ACCEPTED, verify not already
// converted, copy customer + items as fresh snapshots, recalculate totals (never
// trust the quote's stored totals blindly — recompute for defensive consistency),
// generate invoice number, one transaction. `invoices.quoteId` is the authoritative
// relationship (DB Design section 23) — "already converted" means a row already
// exists with this quoteId, exposed via the unique Quote.invoice relation.

type RouteParams = { params: Promise<{ id: string }> };

const CUSTOMER_SELECT = { id: true, name: true, companyName: true, email: true } as const;
const QUOTE_SELECT = { id: true, quoteNumber: true } as const;

const MAX_NUMBER_ATTEMPTS = 5;

export async function POST(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const quote = await prisma.quote.findFirst({
    where: { id, userId: user.id },
    include: { items: { orderBy: { sortOrder: "asc" } }, invoice: { select: { id: true } } },
  });
  if (!quote) {
    return apiError("QUOTE_NOT_FOUND", "Quote was not found.", 404);
  }
  if (quote.invoice) {
    return apiError("QUOTE_ALREADY_CONVERTED", "This quote has already been converted to an invoice.", 409);
  }
  if (quote.status !== "ACCEPTED") {
    return apiError("QUOTE_NOT_ACCEPTED", "Only an accepted quote can be converted to an invoice.", 409);
  }

  // Recalculate rather than copy the quote's stored totals — the calculation engine
  // remains the single source of truth for what a set of items totals to
  // (CLAUDE.md rule 10 / Web Dev Standards section 18, no duplicate financial logic).
  const { items: calculatedItems, totals } = calculateDocumentTotals(
    quote.items.map((item) => ({
      quantity: formatDecimal(item.quantity, 3),
      unitPrice: formatDecimal(item.unitPrice),
      discountAmount: formatDecimal(item.discountAmount),
      taxRate: formatDecimal(item.taxRate),
    }))
  );

  for (let attempt = 1; attempt <= MAX_NUMBER_ATTEMPTS; attempt++) {
    try {
      const invoice = await prisma.$transaction(async (tx) => {
        const last = await tx.invoice.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          select: { invoiceNumber: true },
        });
        const invoiceNumber = getNextDocumentNumber(last?.invoiceNumber ?? null, "INV");

        return tx.invoice.create({
          data: {
            userId: user.id,
            customerId: quote.customerId,
            quoteId: quote.id,
            invoiceNumber,
            invoiceDate: new Date(),
            status: "UNPAID",
            subtotal: totals.subtotal,
            discountAmount: totals.discountAmount,
            taxAmount: totals.taxAmount,
            totalAmount: totals.totalAmount,
            paidAmount: "0.00",
            notes: quote.notes,
            terms: quote.terms,
            items: {
              create: calculatedItems.map((item, index) => ({
                productId: quote.items[index].productId,
                name: quote.items[index].name,
                description: quote.items[index].description,
                unit: quote.items[index].unit,
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
          include: { items: true, customer: { select: CUSTOMER_SELECT }, quote: { select: QUOTE_SELECT } },
        });
      });

      return apiSuccess(serializeInvoice(invoice), { status: 201 });
    } catch (error) {
      const isUniqueConflict =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_ERROR_CODE;

      if (isUniqueConflict) {
        // Two possible unique constraints: (userId, invoiceNumber) — retry with a
        // freshly computed number — or Invoice.quoteId — a concurrent request beat
        // this one to converting the same quote. Distinguish by re-checking whether
        // the quote now has an invoice, rather than guessing from error internals.
        const nowConverted = await prisma.quote.findUnique({
          where: { id: quote.id },
          select: { invoice: { select: { id: true } } },
        });
        if (nowConverted?.invoice) {
          return apiError("QUOTE_ALREADY_CONVERTED", "This quote has already been converted to an invoice.", 409);
        }
        if (attempt < MAX_NUMBER_ATTEMPTS) {
          continue;
        }
      }

      console.error("Failed to convert quote to invoice:", error);
      return apiInternalError();
    }
  }

  return apiInternalError();
}

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError, apiInternalError } from "@/lib/api-response";
import { quoteUpdateSchema } from "@/lib/validations/quote";
import { calculateQuoteTotals } from "@/lib/quote-calculation";
import { serializeQuote } from "@/lib/serialize-quote";
import { validateQuoteReferences } from "@/lib/quote-ownership";

// docs/API Specification.md sections 31, 35-36, 60.
// A resource outside the user's scope returns 404, never 403 (section 60).
// Editing/deleting is restricted to DRAFT quotes (section 35-36) — sent/accepted/
// rejected/expired quotes are historical records once they leave draft.

type RouteParams = { params: Promise<{ id: string }> };

const CUSTOMER_SELECT = { id: true, name: true, companyName: true, email: true } as const;

const notFound = () => apiError("QUOTE_NOT_FOUND", "Quote was not found.", 404);
const notDraft = () =>
  apiError("QUOTE_NOT_DRAFT", "Only draft quotes can be edited or deleted.", 409);

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const quote = await prisma.quote.findFirst({
    where: { id, userId: user.id },
    include: { items: { orderBy: { sortOrder: "asc" } }, customer: { select: CUSTOMER_SELECT } },
  });
  if (!quote) return notFound();

  return apiSuccess(serializeQuote(quote));
}

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = quoteUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }
  const input = parsed.data;

  const existing = await prisma.quote.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();
  if (existing.status !== "DRAFT") return notDraft();

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

  try {
    const quote = await prisma.$transaction(async (tx) => {
      await tx.quoteItem.deleteMany({ where: { quoteId: id } });

      return tx.quote.update({
        where: { id },
        data: {
          customerId: input.customerId,
          quoteDate: new Date(input.quoteDate),
          expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
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
        include: { items: true, customer: { select: CUSTOMER_SELECT } },
      });
    });

    return apiSuccess(serializeQuote(quote));
  } catch (error) {
    console.error("Failed to update quote:", error);
    return apiInternalError();
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const existing = await prisma.quote.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();
  if (existing.status !== "DRAFT") return notDraft();

  try {
    await prisma.quote.delete({ where: { id } });
    return apiSuccess({ message: "Quote deleted successfully." });
  } catch (error) {
    console.error("Failed to delete quote:", error);
    return apiInternalError();
  }
}

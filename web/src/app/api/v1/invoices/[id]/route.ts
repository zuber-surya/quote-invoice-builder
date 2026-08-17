import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError, apiInternalError } from "@/lib/api-response";
import { invoiceUpdateSchema } from "@/lib/validations/invoice";
import { calculateDocumentTotals } from "@/lib/document-calculation";
import { serializeInvoice } from "@/lib/serialize-invoice";
import { validateCustomerAndProductReferences } from "@/lib/document-ownership";

// docs/API Specification.md sections 45, 48-49, 60.
// A resource outside the user's scope returns 404, never 403 (section 60).
// Editing/deleting is restricted to DRAFT invoices (section 48-49) — once an
// invoice is issued (UNPAID+), financial fields lock; for V1 that just means
// DRAFT-only, same restriction shape as quotes.

type RouteParams = { params: Promise<{ id: string }> };

const CUSTOMER_SELECT = { id: true, name: true, companyName: true, email: true } as const;
const QUOTE_SELECT = { id: true, quoteNumber: true } as const;

const notFound = () => apiError("INVOICE_NOT_FOUND", "Invoice was not found.", 404);
const notDraft = () =>
  apiError("INVOICE_NOT_DRAFT", "Only draft invoices can be edited or deleted.", 409);

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      customer: { select: CUSTOMER_SELECT },
      quote: { select: QUOTE_SELECT },
    },
  });
  if (!invoice) return notFound();

  return apiSuccess(serializeInvoice(invoice));
}

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = invoiceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }
  const input = parsed.data;

  const existing = await prisma.invoice.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();
  if (existing.status !== "DRAFT") return notDraft();

  const references = await validateCustomerAndProductReferences(user.id, input.customerId, input.items);
  if (!references.ok) return references.error;

  const { items: calculatedItems, totals } = calculateDocumentTotals(
    input.items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountAmount: item.discountAmount,
      taxRate: item.taxRate,
    }))
  );

  try {
    const invoice = await prisma.$transaction(async (tx) => {
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

      return tx.invoice.update({
        where: { id },
        data: {
          customerId: input.customerId,
          invoiceDate: new Date(input.invoiceDate),
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
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
              sacCode: input.items[index].sacCode,
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

    return apiSuccess(serializeInvoice(invoice));
  } catch (error) {
    console.error("Failed to update invoice:", error);
    return apiInternalError();
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const existing = await prisma.invoice.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();
  if (existing.status !== "DRAFT") return notDraft();

  try {
    await prisma.invoice.delete({ where: { id } });
    return apiSuccess({ message: "Invoice deleted successfully." });
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    return apiInternalError();
  }
}

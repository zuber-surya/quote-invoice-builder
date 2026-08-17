import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiSuccess, apiUnauthorized, apiValidationError, apiInternalError } from "@/lib/api-response";
import { invoiceSchema, invoiceListQuerySchema } from "@/lib/validations/invoice";
import { calculateDocumentTotals } from "@/lib/document-calculation";
import { getNextDocumentNumber, UNIQUE_CONSTRAINT_ERROR_CODE } from "@/lib/document-number";
import { serializeInvoice } from "@/lib/serialize-invoice";
import { validateCustomerAndProductReferences } from "@/lib/document-ownership";

// docs/API Specification.md sections 43, 46-47.
// Ownership: every query is scoped by the authenticated user's id (CLAUDE.md rule 11).
// Financial totals are always server-calculated (CLAUDE.md rule 10) — the client
// never supplies subtotal/taxAmount/totalAmount/lineTotal, only the raw item inputs.
// This is direct invoice creation (not from a quote) — see
// app/api/v1/quotes/[id]/convert-to-invoice/route.ts for the conversion path.

const CUSTOMER_SELECT = { id: true, name: true, companyName: true, email: true } as const;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const parsed = invoiceListQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }
  const { page, pageSize, search, status, customerId, dateFrom, dateTo, sortBy, sortOrder } = parsed.data;

  const where: Prisma.InvoiceWhereInput = {
    userId: user.id,
    ...(status ? { status } : {}),
    ...(customerId ? { customerId } : {}),
    ...(dateFrom || dateTo
      ? { invoiceDate: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), ...(dateTo ? { lte: new Date(dateTo) } : {}) } }
      : {}),
    ...(search
      ? {
          OR: [
            { invoiceNumber: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  try {
    const [invoices, total] = await prisma.$transaction([
      prisma.invoice.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { customer: { select: CUSTOMER_SELECT } },
      }),
      prisma.invoice.count({ where }),
    ]);

    return apiSuccess(
      invoices.map((invoice) => serializeInvoice(invoice)),
      { meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } }
    );
  } catch (error) {
    console.error("Failed to list invoices:", error);
    return apiInternalError();
  }
}

const MAX_NUMBER_ATTEMPTS = 5;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const body = await request.json().catch(() => null);
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }
  const input = parsed.data;

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
            customerId: input.customerId,
            invoiceNumber,
            invoiceDate: new Date(input.invoiceDate),
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
            status: "UNPAID",
            subtotal: totals.subtotal,
            discountAmount: totals.discountAmount,
            taxAmount: totals.taxAmount,
            totalAmount: totals.totalAmount,
            paidAmount: "0.00",
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
          include: { items: true, customer: { select: CUSTOMER_SELECT } },
        });
      });

      return apiSuccess(serializeInvoice(invoice), { status: 201 });
    } catch (error) {
      // The only unique constraint an invoice create can hit is (userId, invoiceNumber).
      const isNumberConflict =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_ERROR_CODE;

      if (isNumberConflict && attempt < MAX_NUMBER_ATTEMPTS) {
        continue;
      }

      console.error("Failed to create invoice:", error);
      return apiInternalError();
    }
  }

  return apiInternalError();
}

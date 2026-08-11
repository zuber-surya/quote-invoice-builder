import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError, apiInternalError } from "@/lib/api-response";
import { paymentSchema } from "@/lib/validations/payment";
import { formatDecimal } from "@/lib/format-decimal";

// docs/API Specification.md sections 50-52. docs/Code & Development Workflow.md
// section 39 — "test concurrent payments." Uses optimistic concurrency (update
// gated on the paidAmount value just read) rather than a DB-level lock: if two
// payments race, the loser's update affects 0 rows and retries against the
// freshly re-read invoice, so an overpayment can never be committed even under
// concurrent requests. The schema has a single paymentNotes field on Invoice —
// no payment history table — a fixed V1 simplification, not something to work
// around here.

type RouteParams = { params: Promise<{ id: string }> };

const MAX_ATTEMPTS = 5;

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }
  const { amount, paymentDate, notes } = parsed.data;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const invoice = await prisma.invoice.findFirst({ where: { id, userId: user.id } });
    if (!invoice) {
      return apiError("INVOICE_NOT_FOUND", "Invoice was not found.", 404);
    }
    if (invoice.status === "PAID") {
      return apiError("INVOICE_ALREADY_PAID", "This invoice has already been paid in full.", 409);
    }

    const newPaidAmount = new Prisma.Decimal(invoice.paidAmount).plus(amount);
    if (newPaidAmount.greaterThan(invoice.totalAmount)) {
      return apiError(
        "INVALID_PAYMENT_AMOUNT",
        `Payment exceeds the remaining balance of ${formatDecimal(
          new Prisma.Decimal(invoice.totalAmount).minus(invoice.paidAmount)
        )}.`,
        409
      );
    }

    const isFullyPaid = newPaidAmount.equals(invoice.totalAmount);
    const newStatus = isFullyPaid ? "PAID" : "PARTIALLY_PAID";

    const { count } = await prisma.invoice.updateMany({
      where: { id, paidAmount: invoice.paidAmount },
      data: {
        paidAmount: newPaidAmount.toFixed(2),
        status: newStatus,
        paidDate: isFullyPaid ? new Date(paymentDate || new Date().toISOString().slice(0, 10)) : invoice.paidDate,
        paymentNotes: notes ?? invoice.paymentNotes,
      },
    });

    if (count === 0) {
      // Another request updated paidAmount between our read and write — retry
      // against the freshly re-read invoice rather than risk a stale overwrite.
      continue;
    }

    return apiSuccess({
      invoiceId: id,
      totalAmount: formatDecimal(invoice.totalAmount),
      paidAmount: newPaidAmount.toFixed(2),
      remainingAmount: new Prisma.Decimal(invoice.totalAmount).minus(newPaidAmount).toFixed(2),
      status: newStatus,
      paidDate: isFullyPaid ? (paymentDate || new Date().toISOString().slice(0, 10)) : null,
    });
  }

  console.error(`Failed to record payment for invoice ${id}: exceeded retry attempts under contention`);
  return apiInternalError();
}

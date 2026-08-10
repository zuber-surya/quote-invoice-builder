import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError, apiInternalError } from "@/lib/api-response";
import { customerSchema } from "@/lib/validations/customer";

// docs/API Specification.md sections 21-23.
// Section 60 — a resource outside the user's scope returns 404, never 403,
// to avoid leaking whether it exists for another user.

type RouteParams = { params: Promise<{ id: string }> };

const notFound = () => apiError("CUSTOMER_NOT_FOUND", "Customer was not found.", 404);

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const customer = await prisma.customer.findFirst({
    where: { id, userId: user.id },
    include: { _count: { select: { quotes: true, invoices: true } } },
  });

  if (!customer) return notFound();

  const { _count, ...rest } = customer;
  return apiSuccess({ ...rest, quoteCount: _count.quotes, invoiceCount: _count.invoices });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const existing = await prisma.customer.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess(customer);
  } catch (error) {
    console.error("Failed to update customer:", error);
    return apiInternalError();
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const existing = await prisma.customer.findFirst({
    where: { id, userId: user.id },
    include: { _count: { select: { quotes: true, invoices: true } } },
  });
  if (!existing) return notFound();

  if (existing._count.quotes > 0 || existing._count.invoices > 0) {
    return apiError(
      "CUSTOMER_HAS_DOCUMENTS",
      "This customer cannot be deleted because they have existing documents.",
      409
    );
  }

  try {
    await prisma.customer.delete({ where: { id } });
    return apiSuccess({ message: "Customer deleted successfully." });
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return apiInternalError();
  }
}

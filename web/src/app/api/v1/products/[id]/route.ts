import type { Product } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError, apiInternalError } from "@/lib/api-response";
import { formatDecimal } from "@/lib/format-decimal";
import { productSchema } from "@/lib/validations/product";

const withFormattedMoney = (product: Product) => ({
  ...product,
  price: formatDecimal(product.price),
  taxRate: formatDecimal(product.taxRate),
});

// docs/API Specification.md sections 26-28.
// Section 60 — a resource outside the user's scope returns 404, never 403,
// to avoid leaking whether it exists for another user.
// Unlike customers, products can always be deleted: quote_items/invoice_items
// snapshot product data and set product_id to NULL on delete (schema.prisma
// onDelete: SetNull) — see docs/Database Design Document.md section 26.

type RouteParams = { params: Promise<{ id: string }> };

const notFound = () => apiError("PRODUCT_NOT_FOUND", "Product was not found.", 404);

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const product = await prisma.product.findFirst({ where: { id, userId: user.id } });
  if (!product) return notFound();

  return apiSuccess(withFormattedMoney(product));
}

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const existing = await prisma.product.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();

  try {
    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess(withFormattedMoney(product));
  } catch (error) {
    console.error("Failed to update product:", error);
    return apiInternalError();
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const existing = await prisma.product.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();

  try {
    await prisma.product.delete({ where: { id } });
    return apiSuccess({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return apiInternalError();
  }
}

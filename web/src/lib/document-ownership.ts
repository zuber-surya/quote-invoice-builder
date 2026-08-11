import { prisma } from "./prisma";
import { apiError } from "./api-response";

// Shared by POST/PUT for both Quotes and Invoices — every document create/update
// needs to verify the customer and any referenced products belong to the current
// user before touching data. CLAUDE.md rule 11: every query touching business data
// must filter by the authenticated user's ownership.
export async function validateCustomerAndProductReferences(
  userId: string,
  customerId: string,
  items: { productId?: string | null }[]
) {
  const customer = await prisma.customer.findFirst({ where: { id: customerId, userId } });
  if (!customer) {
    return { ok: false as const, error: apiError("CUSTOMER_NOT_FOUND", "Customer was not found.", 404) };
  }

  const productIds = [...new Set(items.map((item) => item.productId).filter((id): id is string => !!id))];
  if (productIds.length > 0) {
    const ownedProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, userId },
      select: { id: true },
    });
    if (ownedProducts.length !== productIds.length) {
      return { ok: false as const, error: apiError("PRODUCT_NOT_FOUND", "One or more products were not found.", 404) };
    }
  }

  return { ok: true as const, customer };
}

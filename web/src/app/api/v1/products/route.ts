import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiSuccess, apiUnauthorized, apiValidationError, apiInternalError } from "@/lib/api-response";
import { formatDecimal } from "@/lib/format-decimal";
import { productSchema, productListQuerySchema } from "@/lib/validations/product";

// docs/API Specification.md sections 24-25.
// Ownership: every query is scoped by the authenticated user's id (CLAUDE.md rule 11),
// never by an id supplied in the request body.

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const parsed = productListQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }
  const { page, pageSize, search, sortBy, sortOrder } = parsed.data;

  const where: Prisma.ProductWhereInput = {
    userId: user.id,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  try {
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    const data = products.map((product) => ({
      ...product,
      price: formatDecimal(product.price),
      taxRate: formatDecimal(product.taxRate),
    }));

    return apiSuccess(data, {
      meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    });
  } catch (error) {
    console.error("Failed to list products:", error);
    return apiInternalError();
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  try {
    const product = await prisma.product.create({
      data: { ...parsed.data, userId: user.id },
    });

    return apiSuccess(
      { ...product, price: formatDecimal(product.price), taxRate: formatDecimal(product.taxRate) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create product:", error);
    return apiInternalError();
  }
}

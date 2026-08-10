import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiSuccess, apiUnauthorized, apiValidationError, apiInternalError } from "@/lib/api-response";
import { customerSchema, customerListQuerySchema } from "@/lib/validations/customer";

// docs/API Specification.md sections 19-20.
// Ownership: every query is scoped by the authenticated user's id (CLAUDE.md rule 11),
// never by an id supplied in the request body.

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const parsed = customerListQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }
  const { page, pageSize, search, sortBy, sortOrder } = parsed.data;

  const where: Prisma.CustomerWhereInput = {
    userId: user.id,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { companyName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  try {
    const [customers, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { quotes: true, invoices: true } } },
      }),
      prisma.customer.count({ where }),
    ]);

    const data = customers.map(({ _count, ...customer }) => ({
      ...customer,
      quoteCount: _count.quotes,
      invoiceCount: _count.invoices,
    }));

    return apiSuccess(data, {
      meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    });
  } catch (error) {
    console.error("Failed to list customers:", error);
    return apiInternalError();
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const body = await request.json().catch(() => null);
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  try {
    const customer = await prisma.customer.create({
      data: { ...parsed.data, userId: user.id },
    });

    return apiSuccess(customer, { status: 201 });
  } catch (error) {
    console.error("Failed to create customer:", error);
    return apiInternalError();
  }
}

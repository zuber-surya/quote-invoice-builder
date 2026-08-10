import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError, apiInternalError } from "@/lib/api-response";
import { quoteStatusSchema } from "@/lib/validations/quote";
import { serializeQuote } from "@/lib/serialize-quote";
import type { QuoteStatus } from "@prisma/client";

// docs/API Specification.md sections 37-38. The service layer (here, since there's
// no separate service tier yet) is the only place allowed to validate transitions —
// never trust a client-supplied "this is a valid next status".
const ALLOWED_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  DRAFT: ["SENT"],
  SENT: ["ACCEPTED", "REJECTED", "EXPIRED"],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
};

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = quoteStatusSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const existing = await prisma.quote.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return apiError("QUOTE_NOT_FOUND", "Quote was not found.", 404);
  }

  const nextStatus = parsed.data.status;
  if (!ALLOWED_TRANSITIONS[existing.status].includes(nextStatus)) {
    return apiError(
      "INVALID_STATUS_TRANSITION",
      `Cannot change quote status from ${existing.status} to ${nextStatus}.`,
      409
    );
  }

  try {
    const quote = await prisma.quote.update({
      where: { id },
      data: { status: nextStatus },
      include: { items: { orderBy: { sortOrder: "asc" } }, customer: { select: { id: true, name: true, companyName: true, email: true } } },
    });

    return apiSuccess(serializeQuote(quote));
  } catch (error) {
    console.error("Failed to update quote status:", error);
    return apiInternalError();
  }
}

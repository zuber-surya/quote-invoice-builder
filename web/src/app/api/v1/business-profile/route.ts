import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError, apiInternalError } from "@/lib/api-response";
import { businessProfileSchema } from "@/lib/validations/business-profile";

// docs/API Specification.md sections 17-18.
// Ownership: every query is scoped by the authenticated user's id (CLAUDE.md rule 11),
// never by an id supplied in the request body.

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const profile = await prisma.businessProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return apiError("BUSINESS_PROFILE_NOT_FOUND", "Business profile has not been set up yet.", 404);
  }

  return apiSuccess(profile);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const body = await request.json().catch(() => null);
  const parsed = businessProfileSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  try {
    const profile = await prisma.businessProfile.upsert({
      where: { userId: user.id },
      update: parsed.data,
      create: { ...parsed.data, userId: user.id },
    });

    return apiSuccess(profile);
  } catch (error) {
    console.error("Failed to save business profile:", error);
    return apiInternalError();
  }
}

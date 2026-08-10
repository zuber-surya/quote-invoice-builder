import { apiSuccess, apiUnauthorized } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/get-current-user";

// docs/API Specification.md section 16.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  return apiSuccess(user);
}

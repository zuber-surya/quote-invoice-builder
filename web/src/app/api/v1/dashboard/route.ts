import { getCurrentUser } from "@/lib/get-current-user";
import { apiSuccess, apiUnauthorized, apiInternalError } from "@/lib/api-response";
import { getDashboardData } from "@/lib/get-dashboard-data";

// docs/API Specification.md sections 54-56. Aggregation logic lives in
// lib/get-dashboard-data.ts, shared with the server-rendered dashboard page.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  try {
    const data = await getDashboardData(user.id);
    return apiSuccess(data);
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    return apiInternalError();
  }
}

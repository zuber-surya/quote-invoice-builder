import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));

import { getCurrentUser } from "@/lib/get-current-user";
import { GET } from "./route";

const user = { id: "user-1", name: "Demo", email: "demo@example.com" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/me", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns only the authenticated user's own data", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);

    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(user);
  });
});

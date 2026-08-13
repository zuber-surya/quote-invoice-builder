import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    businessProfile: { findUnique: vi.fn(), upsert: vi.fn() },
  },
}));

import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { GET, PUT } from "./route";

const user = { id: "user-1", name: "Demo", email: "demo@example.com" };
const otherUser = { id: "user-2", name: "Other", email: "other@example.com" };

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/v1/business-profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/business-profile", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns 404 BUSINESS_PROFILE_NOT_FOUND when no profile exists yet", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.businessProfile.findUnique).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("BUSINESS_PROFILE_NOT_FOUND");
  });

  it("scopes the lookup to the authenticated user, never another user's profile", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(otherUser);
    vi.mocked(prisma.businessProfile.findUnique).mockResolvedValue(null);

    await GET();

    expect(prisma.businessProfile.findUnique).toHaveBeenCalledWith({ where: { userId: "user-2" } });
  });

  it("returns the profile when it exists", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.businessProfile.findUnique).mockResolvedValue({
      userId: "user-1",
      businessName: "Acme Co",
    } as never);

    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.businessName).toBe("Acme Co");
  });
});

describe("PUT /api/v1/business-profile", () => {
  const validBody = { businessName: "Acme Co", currency: "INR" };

  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await PUT(jsonRequest(validBody));
    expect(response.status).toBe(401);
  });

  it("rejects an invalid body — missing required businessName", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await PUT(jsonRequest({ currency: "INR" }));
    expect(response.status).toBe(400);
  });

  it("rejects an invalid website URL", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await PUT(jsonRequest({ ...validBody, website: "not-a-url" }));
    expect(response.status).toBe(400);
  });

  it("upserts scoped to the authenticated user's id, not a client-supplied id", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.businessProfile.upsert).mockResolvedValue({ userId: "user-1", ...validBody } as never);

    const response = await PUT(jsonRequest(validBody));

    expect(response.status).toBe(200);
    const call = vi.mocked(prisma.businessProfile.upsert).mock.calls[0][0];
    expect(call.where).toEqual({ userId: "user-1" });
    expect(call.create).toMatchObject({ userId: "user-1", businessName: "Acme Co" });
  });
});

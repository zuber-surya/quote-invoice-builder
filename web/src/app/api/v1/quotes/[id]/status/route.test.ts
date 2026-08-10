import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    quote: { findFirst: vi.fn(), update: vi.fn() },
  },
}));

import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { PATCH } from "./route";

const user = { id: "user-1", name: "Demo", email: "demo@example.com" };
const QUOTE_ID = "660e8400-e29b-41d4-a716-446655440002";

function params() {
  return { params: Promise.resolve({ id: QUOTE_ID }) };
}

function statusRequest(status: string) {
  return new Request(`http://localhost/api/v1/quotes/${QUOTE_ID}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

function quoteWith(status: string) {
  return {
    id: QUOTE_ID,
    userId: "user-1",
    status,
    quoteNumber: "Q-00001",
    quoteDate: new Date("2026-08-10"),
    expiryDate: null,
    subtotal: "100.00",
    discountAmount: "0.00",
    taxAmount: "0.00",
    totalAmount: "100.00",
    notes: null,
    terms: null,
    createdAt: new Date("2026-08-10"),
    items: [],
    customer: { id: "customer-1", name: "Ahmed Khan", companyName: null, email: null },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/v1/quotes/:id/status", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await PATCH(statusRequest("SENT"), params());
    expect(response.status).toBe(401);
  });

  it("rejects an unknown status value", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await PATCH(statusRequest("CANCELLED"), params());
    expect(response.status).toBe(400);
  });

  it("returns 404 when the quote isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(null);

    const response = await PATCH(statusRequest("SENT"), params());
    expect(response.status).toBe(404);
  });

  it.each([
    ["DRAFT", "SENT"],
    ["SENT", "ACCEPTED"],
    ["SENT", "REJECTED"],
    ["SENT", "EXPIRED"],
  ])("allows %s -> %s", async (from, to) => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(quoteWith(from) as never);
    vi.mocked(prisma.quote.update).mockResolvedValue(quoteWith(to) as never);

    const response = await PATCH(statusRequest(to), params());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.status).toBe(to);
  });

  it.each([
    ["DRAFT", "ACCEPTED"],
    ["DRAFT", "REJECTED"],
    ["DRAFT", "EXPIRED"],
    ["ACCEPTED", "SENT"],
    ["ACCEPTED", "DRAFT" as never],
    ["REJECTED", "ACCEPTED"],
    ["EXPIRED", "SENT"],
  ])("rejects %s -> %s as an invalid transition", async (from, to) => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(quoteWith(from) as never);

    const response = await PATCH(statusRequest(to as string), params());

    expect([400, 409]).toContain(response.status);
    const body = await response.json();
    expect(["VALIDATION_ERROR", "INVALID_STATUS_TRANSITION"]).toContain(body.error.code);
    expect(prisma.quote.update).not.toHaveBeenCalled();
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Prisma } from "@prisma/client";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    customer: { findFirst: vi.fn() },
    product: { findMany: vi.fn() },
    quote: { findFirst: vi.fn(), update: vi.fn(), delete: vi.fn() },
    quoteItem: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { GET, PUT, DELETE } from "./route";

const user = { id: "user-1", name: "Demo", email: "demo@example.com" };
const CUSTOMER_ID = "550e8400-e29b-41d4-a716-446655440001";
const QUOTE_ID = "660e8400-e29b-41d4-a716-446655440002";

function params(id = QUOTE_ID) {
  return { params: Promise.resolve({ id }) };
}

function jsonRequest(body: unknown, method = "PUT") {
  return new Request(`http://localhost/api/v1/quotes/${QUOTE_ID}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const draftQuote = { id: QUOTE_ID, userId: "user-1", status: "DRAFT" };
const sentQuote = { id: QUOTE_ID, userId: "user-1", status: "SENT" };

const updateBody = {
  customerId: CUSTOMER_ID,
  quoteDate: "2026-08-10",
  items: [{ name: "Consulting", unit: "Hour", quantity: "1", unitPrice: "100.00" }],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.$transaction).mockImplementation((arg: unknown) =>
    (arg as (tx: typeof prisma) => Promise<unknown>)(prisma)
  );
});

describe("GET /api/v1/quotes/:id", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET(new Request("http://localhost"), params());
    expect(response.status).toBe(401);
  });

  it("returns 404 when the quote isn't owned by the user (API Spec section 76 Test 1 pattern)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), params());

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("QUOTE_NOT_FOUND");
    // never 403 — confirms the ownership filter, not a separate authorization check
    const call = vi.mocked(prisma.quote.findFirst).mock.calls[0][0];
    expect(call?.where).toMatchObject({ id: QUOTE_ID, userId: "user-1" });
  });

  it("returns the serialized quote when owned", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue({
      ...draftQuote,
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
      customer: { id: CUSTOMER_ID, name: "Ahmed Khan", companyName: null, email: null },
    } as never);

    const response = await GET(new Request("http://localhost"), params());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.quoteNumber).toBe("Q-00001");
  });
});

describe("PUT /api/v1/quotes/:id", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await PUT(jsonRequest(updateBody), params());
    expect(response.status).toBe(401);
  });

  it("returns 404 when the quote isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(null);

    const response = await PUT(jsonRequest(updateBody), params());
    expect(response.status).toBe(404);
  });

  it("returns 409 QUOTE_NOT_DRAFT when the quote is no longer a draft", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(sentQuote as never);

    const response = await PUT(jsonRequest(updateBody), params());

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("QUOTE_NOT_DRAFT");
  });

  it("rejects invalid item data", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await PUT(
      jsonRequest({ ...updateBody, items: [{ ...updateBody.items[0], quantity: "0" }] }),
      params()
    );
    expect(response.status).toBe(400);
  });

  it("recalculates totals and replaces items for a draft quote", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(draftQuote as never);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue({ id: CUSTOMER_ID, userId: "user-1" } as never);
    vi.mocked(prisma.quoteItem.deleteMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(prisma.quote.update).mockImplementation((args: Prisma.QuoteUpdateArgs) =>
      Promise.resolve({
        id: QUOTE_ID,
        quoteNumber: "Q-00001",
        ...(args as { data: Record<string, unknown> }).data,
        items: (
          (args as { data: { items: { create: Record<string, unknown>[] } } }).data.items.create
        ).map((item, i) => ({ id: `item-${i}`, ...item })),
        customer: { id: CUSTOMER_ID, name: "Ahmed Khan", companyName: null, email: null },
        createdAt: new Date("2026-08-10"),
      }) as never
    );

    const response = await PUT(jsonRequest(updateBody), params());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.totalAmount).toBe("100.00");
    expect(prisma.quoteItem.deleteMany).toHaveBeenCalledWith({ where: { quoteId: QUOTE_ID } });
  });
});

describe("DELETE /api/v1/quotes/:id", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());
    expect(response.status).toBe(401);
  });

  it("returns 404 when the quote isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(null);

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());
    expect(response.status).toBe(404);
  });

  it("returns 409 QUOTE_NOT_DRAFT for a non-draft quote", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(sentQuote as never);

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("QUOTE_NOT_DRAFT");
  });

  it("deletes a draft quote", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(draftQuote as never);
    vi.mocked(prisma.quote.delete).mockResolvedValue(draftQuote as never);

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());

    expect(response.status).toBe(200);
    expect(prisma.quote.delete).toHaveBeenCalledWith({ where: { id: QUOTE_ID } });
  });
});

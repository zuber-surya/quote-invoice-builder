import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Prisma } from "@prisma/client";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    customer: { findFirst: vi.fn() },
    product: { findMany: vi.fn() },
    quote: { findFirst: vi.fn(), findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "./route";

const user = { id: "user-1", name: "Demo", email: "demo@example.com" };
const CUSTOMER_ID = "550e8400-e29b-41d4-a716-446655440001";
const customer = { id: CUSTOMER_ID, userId: "user-1", name: "Ahmed Khan" };

function jsonRequest(url: string, body: unknown, method = "POST") {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.$transaction).mockImplementation((arg: unknown) =>
    Array.isArray(arg) ? Promise.all(arg) : (arg as (tx: typeof prisma) => Promise<unknown>)(prisma)
  );
});

describe("GET /api/v1/quotes", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET(new Request("http://localhost/api/v1/quotes"));
    expect(response.status).toBe(401);
  });

  it("scopes the list query to the authenticated user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findMany).mockResolvedValue([]);
    vi.mocked(prisma.quote.count).mockResolvedValue(0);

    await GET(new Request("http://localhost/api/v1/quotes"));

    const call = vi.mocked(prisma.quote.findMany).mock.calls[0][0];
    expect(call?.where).toMatchObject({ userId: "user-1" });
  });

  it("applies the status filter", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findMany).mockResolvedValue([]);
    vi.mocked(prisma.quote.count).mockResolvedValue(0);

    await GET(new Request("http://localhost/api/v1/quotes?status=SENT"));

    const call = vi.mocked(prisma.quote.findMany).mock.calls[0][0];
    expect(call?.where).toMatchObject({ userId: "user-1", status: "SENT" });
  });
});

describe("POST /api/v1/quotes", () => {
  const validBody = {
    customerId: CUSTOMER_ID,
    quoteDate: "2026-08-10",
    items: [
      { name: "Consulting", unit: "Hour", quantity: "2", unitPrice: "10000.00", discountAmount: "1000.00", taxRate: "18.00" },
    ],
  };

  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await POST(jsonRequest("http://localhost/api/v1/quotes", validBody));
    expect(response.status).toBe(401);
  });

  it("rejects an invalid body", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await POST(jsonRequest("http://localhost/api/v1/quotes", { customerId: "not-a-uuid" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 CUSTOMER_NOT_FOUND when the customer isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue(null);

    const response = await POST(jsonRequest("http://localhost/api/v1/quotes", validBody));

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("CUSTOMER_NOT_FOUND");
  });

  it("returns 404 PRODUCT_NOT_FOUND when a referenced product isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue(customer as never);
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);

    const response = await POST(
      jsonRequest("http://localhost/api/v1/quotes", {
        ...validBody,
        items: [{ ...validBody.items[0], productId: "550e8400-e29b-41d4-a716-446655440000" }],
      })
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("PRODUCT_NOT_FOUND");
  });

  it("calculates totals server-side and creates the quote — API Spec section 76 Test 2", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue(customer as never);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(null); // no prior quotes -> Q-00001

    vi.mocked(prisma.quote.create).mockImplementation((args: Prisma.QuoteCreateArgs) =>
      Promise.resolve({
        id: "quote-1",
        ...(args as { data: Record<string, unknown> }).data,
        items: (
          (args as { data: { items: { create: Record<string, unknown>[] } } }).data.items.create
        ).map((item, i) => ({ id: `item-${i}`, ...item })),
        customer: { id: customer.id, name: customer.name, companyName: null, email: null },
        createdAt: new Date("2026-08-10T08:00:00Z"),
      }) as never
    );

    const response = await POST(jsonRequest("http://localhost/api/v1/quotes", validBody));
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.data.quoteNumber).toBe("Q-00001");
    expect(body.data.status).toBe("DRAFT");
    expect(body.data.subtotal).toBe("20000.00");
    expect(body.data.discountAmount).toBe("1000.00");
    expect(body.data.taxAmount).toBe("3420.00");
    expect(body.data.totalAmount).toBe("22420.00");
    expect(body.data.items[0].lineTotal).toBe("22420.00");
  });

  it("never trusts a client-supplied totalAmount", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue(customer as never);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.quote.create).mockImplementation((args: Prisma.QuoteCreateArgs) =>
      Promise.resolve({
        id: "quote-1",
        ...(args as { data: Record<string, unknown> }).data,
        items: [],
        customer: { id: customer.id, name: customer.name, companyName: null, email: null },
        createdAt: new Date("2026-08-10T08:00:00Z"),
      }) as never
    );

    const response = await POST(
      jsonRequest("http://localhost/api/v1/quotes", { ...validBody, totalAmount: "1.00", subtotal: "1.00" })
    );

    const body = await response.json();
    // the client-supplied totalAmount/subtotal are ignored — real calculation wins
    expect(body.data.totalAmount).toBe("22420.00");
  });
});

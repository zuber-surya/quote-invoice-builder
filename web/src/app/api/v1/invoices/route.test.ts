import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Prisma } from "@prisma/client";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    customer: { findFirst: vi.fn() },
    product: { findMany: vi.fn() },
    invoice: { findFirst: vi.fn(), findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
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

describe("GET /api/v1/invoices", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET(new Request("http://localhost/api/v1/invoices"));
    expect(response.status).toBe(401);
  });

  it("scopes the list query to the authenticated user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);
    vi.mocked(prisma.invoice.count).mockResolvedValue(0);

    await GET(new Request("http://localhost/api/v1/invoices"));

    const call = vi.mocked(prisma.invoice.findMany).mock.calls[0][0];
    expect(call?.where).toMatchObject({ userId: "user-1" });
  });

  it("applies the status filter", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);
    vi.mocked(prisma.invoice.count).mockResolvedValue(0);

    await GET(new Request("http://localhost/api/v1/invoices?status=PARTIALLY_PAID"));

    const call = vi.mocked(prisma.invoice.findMany).mock.calls[0][0];
    expect(call?.where).toMatchObject({ userId: "user-1", status: "PARTIALLY_PAID" });
  });
});

describe("POST /api/v1/invoices", () => {
  const validBody = {
    customerId: CUSTOMER_ID,
    invoiceDate: "2026-08-10",
    items: [
      { name: "Consulting", unit: "Hour", quantity: "2", unitPrice: "10000.00", discountAmount: "1000.00", taxRate: "18.00" },
    ],
  };

  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await POST(jsonRequest("http://localhost/api/v1/invoices", validBody));
    expect(response.status).toBe(401);
  });

  it("rejects an invalid body", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await POST(jsonRequest("http://localhost/api/v1/invoices", { customerId: "not-a-uuid" }));
    expect(response.status).toBe(400);
  });

  it("returns 404 CUSTOMER_NOT_FOUND when the customer isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue(null);

    const response = await POST(jsonRequest("http://localhost/api/v1/invoices", validBody));

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("CUSTOMER_NOT_FOUND");
  });

  it("calculates totals server-side, sets status UNPAID and paidAmount 0.00", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue(customer as never);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null); // no prior invoices -> INV-00001

    vi.mocked(prisma.invoice.create).mockImplementation((args: Prisma.InvoiceCreateArgs) =>
      Promise.resolve({
        id: "invoice-1",
        ...(args as { data: Record<string, unknown> }).data,
        items: (
          (args as { data: { items: { create: Record<string, unknown>[] } } }).data.items.create
        ).map((item, i) => ({ id: `item-${i}`, ...item })),
        customer: { id: customer.id, name: customer.name, companyName: null, email: null },
        createdAt: new Date("2026-08-10T08:00:00Z"),
      }) as never
    );

    const response = await POST(jsonRequest("http://localhost/api/v1/invoices", validBody));
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.data.invoiceNumber).toBe("INV-00001");
    expect(body.data.status).toBe("UNPAID");
    expect(body.data.paidAmount).toBe("0.00");
    expect(body.data.remainingAmount).toBe("22420.00");
    expect(body.data.subtotal).toBe("20000.00");
    expect(body.data.totalAmount).toBe("22420.00");
  });
});

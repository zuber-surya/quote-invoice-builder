import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Prisma } from "@prisma/client";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    quote: { findFirst: vi.fn(), findUnique: vi.fn() },
    invoice: { findFirst: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { POST } from "./route";

const user = { id: "user-1", name: "Demo", email: "demo@example.com" };
const QUOTE_ID = "660e8400-e29b-41d4-a716-446655440002";

function params() {
  return { params: Promise.resolve({ id: QUOTE_ID }) };
}

function request() {
  return new Request(`http://localhost/api/v1/quotes/${QUOTE_ID}/convert-to-invoice`, { method: "POST" });
}

function acceptedQuote() {
  return {
    id: QUOTE_ID,
    userId: "user-1",
    customerId: "customer-1",
    status: "ACCEPTED",
    notes: "Thank you.",
    terms: "Valid for 15 days.",
    invoice: null,
    items: [
      {
        productId: null,
        name: "Consulting",
        description: null,
        unit: "Hour",
        quantity: "2.000",
        unitPrice: "10000.00",
        discountAmount: "1000.00",
        taxRate: "18.00",
        taxAmount: "3420.00",
        lineTotal: "22420.00",
      },
    ],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.$transaction).mockImplementation((arg: unknown) =>
    (arg as (tx: typeof prisma) => Promise<unknown>)(prisma)
  );
});

describe("POST /api/v1/quotes/:id/convert-to-invoice", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await POST(request(), params());
    expect(response.status).toBe(401);
  });

  it("returns 404 when the quote isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(null);

    const response = await POST(request(), params());

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("QUOTE_NOT_FOUND");
  });

  it("returns 409 QUOTE_ALREADY_CONVERTED when the quote already has an invoice", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue({
      ...acceptedQuote(),
      invoice: { id: "existing-invoice" },
    } as never);

    const response = await POST(request(), params());

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("QUOTE_ALREADY_CONVERTED");
  });

  it("returns 409 QUOTE_NOT_ACCEPTED for a non-accepted quote", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue({
      ...acceptedQuote(),
      status: "SENT",
    } as never);

    const response = await POST(request(), params());

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("QUOTE_NOT_ACCEPTED");
  });

  it("copies items and recalculates totals into a new UNPAID invoice", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(acceptedQuote() as never);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null); // no prior invoices -> INV-00001

    vi.mocked(prisma.invoice.create).mockImplementation((args: Prisma.InvoiceCreateArgs) =>
      Promise.resolve({
        id: "invoice-1",
        ...(args as { data: Record<string, unknown> }).data,
        items: (
          (args as { data: { items: { create: Record<string, unknown>[] } } }).data.items.create
        ).map((item, i) => ({ id: `item-${i}`, ...item })),
        customer: { id: "customer-1", name: "Ahmed Khan", companyName: null, email: null },
        createdAt: new Date("2026-08-10T08:00:00Z"),
      }) as never
    );

    const response = await POST(request(), params());
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.data.invoiceNumber).toBe("INV-00001");
    expect(body.data.status).toBe("UNPAID");
    expect(body.data.quote.id).toBe(QUOTE_ID);
    expect(body.data.subtotal).toBe("20000.00");
    expect(body.data.taxAmount).toBe("3420.00");
    expect(body.data.totalAmount).toBe("22420.00");
    expect(body.data.items[0].name).toBe("Consulting");
    expect(body.data.notes).toBe("Thank you.");
    expect(body.data.terms).toBe("Valid for 15 days.");
  });

  it("returns 409 QUOTE_ALREADY_CONVERTED on a concurrent double-conversion race", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(acceptedQuote() as never);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null);

    const { Prisma: RealPrisma } = await vi.importActual<typeof import("@prisma/client")>("@prisma/client");
    vi.mocked(prisma.invoice.create).mockRejectedValue(
      new RealPrisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "6.0.0",
      })
    );
    // The re-check inside the catch block finds the invoice a concurrent request just created.
    vi.mocked(prisma.quote.findUnique).mockResolvedValue({ invoice: { id: "winner-invoice" } } as never);

    const response = await POST(request(), params());

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("QUOTE_ALREADY_CONVERTED");
  });
});

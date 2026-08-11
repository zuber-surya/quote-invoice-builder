import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Prisma } from "@prisma/client";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    customer: { findFirst: vi.fn() },
    product: { findMany: vi.fn() },
    invoice: { findFirst: vi.fn(), update: vi.fn(), delete: vi.fn() },
    invoiceItem: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { GET, PUT, DELETE } from "./route";

const user = { id: "user-1", name: "Demo", email: "demo@example.com" };
const CUSTOMER_ID = "550e8400-e29b-41d4-a716-446655440001";
const INVOICE_ID = "770e8400-e29b-41d4-a716-446655440003";

function params(id = INVOICE_ID) {
  return { params: Promise.resolve({ id }) };
}

function jsonRequest(body: unknown, method = "PUT") {
  return new Request(`http://localhost/api/v1/invoices/${INVOICE_ID}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const draftInvoice = { id: INVOICE_ID, userId: "user-1", status: "DRAFT" };
const unpaidInvoice = { id: INVOICE_ID, userId: "user-1", status: "UNPAID" };

const updateBody = {
  customerId: CUSTOMER_ID,
  invoiceDate: "2026-08-10",
  items: [{ name: "Consulting", unit: "Hour", quantity: "1", unitPrice: "100.00" }],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.$transaction).mockImplementation((arg: unknown) =>
    (arg as (tx: typeof prisma) => Promise<unknown>)(prisma)
  );
});

describe("GET /api/v1/invoices/:id", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET(new Request("http://localhost"), params());
    expect(response.status).toBe(401);
  });

  it("returns 404 when the invoice isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), params());

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("INVOICE_NOT_FOUND");
    const call = vi.mocked(prisma.invoice.findFirst).mock.calls[0][0];
    expect(call?.where).toMatchObject({ id: INVOICE_ID, userId: "user-1" });
  });

  it("returns the serialized invoice with remainingAmount when owned", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue({
      ...unpaidInvoice,
      invoiceNumber: "INV-00001",
      invoiceDate: new Date("2026-08-10"),
      dueDate: null,
      quoteId: null,
      subtotal: "100.00",
      discountAmount: "0.00",
      taxAmount: "0.00",
      totalAmount: "100.00",
      paidAmount: "30.00",
      paidDate: null,
      paymentNotes: null,
      notes: null,
      terms: null,
      createdAt: new Date("2026-08-10"),
      items: [],
      customer: { id: CUSTOMER_ID, name: "Ahmed Khan", companyName: null, email: null },
      quote: null,
    } as never);

    const response = await GET(new Request("http://localhost"), params());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.invoiceNumber).toBe("INV-00001");
    expect(body.data.remainingAmount).toBe("70.00");
  });
});

describe("PUT /api/v1/invoices/:id", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await PUT(jsonRequest(updateBody), params());
    expect(response.status).toBe(401);
  });

  it("returns 404 when the invoice isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null);

    const response = await PUT(jsonRequest(updateBody), params());
    expect(response.status).toBe(404);
  });

  it("returns 409 INVOICE_NOT_DRAFT when the invoice is no longer a draft", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(unpaidInvoice as never);

    const response = await PUT(jsonRequest(updateBody), params());

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("INVOICE_NOT_DRAFT");
  });

  it("recalculates totals and replaces items for a draft invoice", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(draftInvoice as never);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue({ id: CUSTOMER_ID, userId: "user-1" } as never);
    vi.mocked(prisma.invoiceItem.deleteMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(prisma.invoice.update).mockImplementation((args: Prisma.InvoiceUpdateArgs) =>
      Promise.resolve({
        id: INVOICE_ID,
        invoiceNumber: "INV-00001",
        paidAmount: "0.00",
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
    expect(prisma.invoiceItem.deleteMany).toHaveBeenCalledWith({ where: { invoiceId: INVOICE_ID } });
  });
});

describe("DELETE /api/v1/invoices/:id", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());
    expect(response.status).toBe(401);
  });

  it("returns 404 when the invoice isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null);

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());
    expect(response.status).toBe(404);
  });

  it("returns 409 INVOICE_NOT_DRAFT for a non-draft invoice", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(unpaidInvoice as never);

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("INVOICE_NOT_DRAFT");
  });

  it("deletes a draft invoice", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(draftInvoice as never);
    vi.mocked(prisma.invoice.delete).mockResolvedValue(draftInvoice as never);

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());

    expect(response.status).toBe(200);
    expect(prisma.invoice.delete).toHaveBeenCalledWith({ where: { id: INVOICE_ID } });
  });
});

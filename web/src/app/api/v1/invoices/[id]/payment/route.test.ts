import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    invoice: { findFirst: vi.fn(), updateMany: vi.fn() },
  },
}));

import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { POST } from "./route";

const user = { id: "user-1", name: "Demo", email: "demo@example.com" };
const INVOICE_ID = "770e8400-e29b-41d4-a716-446655440003";

function params() {
  return { params: Promise.resolve({ id: INVOICE_ID }) };
}

function paymentRequest(body: unknown) {
  return new Request(`http://localhost/api/v1/invoices/${INVOICE_ID}/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function invoiceWith(paidAmount: string, status = "UNPAID", totalAmount = "30000.00") {
  return {
    id: INVOICE_ID,
    userId: "user-1",
    status,
    totalAmount,
    paidAmount,
    paidDate: null,
    paymentNotes: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/v1/invoices/:id/payment", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await POST(paymentRequest({ amount: "100.00" }), params());
    expect(response.status).toBe(401);
  });

  it("rejects an invalid body", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await POST(paymentRequest({ amount: "0.00" }), params());
    expect(response.status).toBe(400);
  });

  it("returns 404 when the invoice isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null);

    const response = await POST(paymentRequest({ amount: "100.00" }), params());
    expect(response.status).toBe(404);
  });

  it("returns 409 INVOICE_ALREADY_PAID for a fully paid invoice", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(invoiceWith("30000.00", "PAID") as never);

    const response = await POST(paymentRequest({ amount: "100.00" }), params());

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("INVOICE_ALREADY_PAID");
  });

  it("returns 409 INVALID_PAYMENT_AMOUNT when the payment exceeds the remaining balance", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(invoiceWith("20000.00") as never);

    const response = await POST(paymentRequest({ amount: "15000.00" }), params());

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("INVALID_PAYMENT_AMOUNT");
  });

  it("records a partial payment — API Spec section 51 example", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(invoiceWith("0.00") as never);
    vi.mocked(prisma.invoice.updateMany).mockResolvedValue({ count: 1 });

    const response = await POST(paymentRequest({ amount: "10000.00" }), params());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.paidAmount).toBe("10000.00");
    expect(body.data.remainingAmount).toBe("20000.00");
    expect(body.data.status).toBe("PARTIALLY_PAID");
    expect(body.data.paidDate).toBeNull();

    expect(prisma.invoice.updateMany).toHaveBeenCalledWith({
      where: { id: INVOICE_ID, paidAmount: "0.00" },
      data: expect.objectContaining({ paidAmount: "10000.00", status: "PARTIALLY_PAID" }),
    });
  });

  it("marks the invoice PAID and sets paidDate on full payment", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(invoiceWith("10000.00") as never);
    vi.mocked(prisma.invoice.updateMany).mockResolvedValue({ count: 1 });

    const response = await POST(paymentRequest({ amount: "20000.00", paymentDate: "2026-08-11" }), params());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.paidAmount).toBe("30000.00");
    expect(body.data.remainingAmount).toBe("0.00");
    expect(body.data.status).toBe("PAID");
    expect(body.data.paidDate).toBe("2026-08-11");
  });

  it("retries against a freshly re-read invoice when a concurrent payment wins the race", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    // First read: paidAmount 0.00. The optimistic update loses the race (count 0).
    vi.mocked(prisma.invoice.findFirst)
      .mockResolvedValueOnce(invoiceWith("0.00") as never)
      // Second read after retry: a concurrent request already recorded 10000.00.
      .mockResolvedValueOnce(invoiceWith("10000.00") as never);
    vi.mocked(prisma.invoice.updateMany)
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 1 });

    const response = await POST(paymentRequest({ amount: "5000.00" }), params());

    expect(response.status).toBe(200);
    const body = await response.json();
    // Correctly built on the re-read balance (10000 + 5000), not the stale first read (0 + 5000).
    expect(body.data.paidAmount).toBe("15000.00");
    expect(prisma.invoice.updateMany).toHaveBeenCalledTimes(2);
    expect(prisma.invoice.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: INVOICE_ID, paidAmount: "10000.00" },
      data: expect.objectContaining({ paidAmount: "15000.00" }),
    });
  });
});

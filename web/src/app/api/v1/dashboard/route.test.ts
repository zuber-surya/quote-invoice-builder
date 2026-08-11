import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    quote: { count: vi.fn(), findMany: vi.fn() },
    invoice: { count: vi.fn(), aggregate: vi.fn(), findMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { GET } from "./route";

const user = { id: "user-1", name: "Demo", email: "demo@example.com" };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.$transaction).mockImplementation((arg: unknown) =>
    Array.isArray(arg) ? Promise.all(arg) : Promise.resolve(arg)
  );
});

describe("GET /api/v1/dashboard", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("scopes every query to the authenticated user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.count).mockResolvedValue(0);
    vi.mocked(prisma.invoice.count).mockResolvedValue(0);
    vi.mocked(prisma.invoice.aggregate).mockResolvedValue({ _sum: { totalAmount: null, paidAmount: null } } as never);
    vi.mocked(prisma.quote.findMany).mockResolvedValue([]);
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);

    await GET();

    expect(prisma.quote.count).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(prisma.invoice.count).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    const aggregateCall = vi.mocked(prisma.invoice.aggregate).mock.calls[0][0];
    expect(aggregateCall?.where).toMatchObject({ userId: "user-1" });
    const recentQuotesCall = vi.mocked(prisma.quote.findMany).mock.calls[0][0];
    expect(recentQuotesCall?.where).toMatchObject({ userId: "user-1" });
    expect(recentQuotesCall?.take).toBe(5);
    const recentInvoicesCall = vi.mocked(prisma.invoice.findMany).mock.calls[0][0];
    expect(recentInvoicesCall?.where).toMatchObject({ userId: "user-1" });
    expect(recentInvoicesCall?.take).toBe(5);
  });

  it("returns zeroed values and empty lists when the user has no data", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.count).mockResolvedValue(0);
    vi.mocked(prisma.invoice.count).mockResolvedValue(0);
    vi.mocked(prisma.invoice.aggregate).mockResolvedValue({ _sum: { totalAmount: null, paidAmount: null } } as never);
    vi.mocked(prisma.quote.findMany).mockResolvedValue([]);
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);

    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual({
      totalQuotes: 0,
      totalInvoices: 0,
      paidAmount: "0.00",
      outstandingAmount: "0.00",
      recentQuotes: [],
      recentInvoices: [],
    });
  });

  it("computes outstandingAmount as sum(totalAmount) - sum(paidAmount)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.count).mockResolvedValue(3);
    vi.mocked(prisma.invoice.count).mockResolvedValue(2);
    vi.mocked(prisma.invoice.aggregate).mockResolvedValue({
      _sum: { totalAmount: "125000.00", paidAmount: "45000.00" },
    } as never);
    vi.mocked(prisma.quote.findMany).mockResolvedValue([]);
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(body.data.totalQuotes).toBe(3);
    expect(body.data.totalInvoices).toBe(2);
    expect(body.data.paidAmount).toBe("45000.00");
    expect(body.data.outstandingAmount).toBe("80000.00");
  });

  it("serializes recent quotes and invoices", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.quote.count).mockResolvedValue(1);
    vi.mocked(prisma.invoice.count).mockResolvedValue(1);
    vi.mocked(prisma.invoice.aggregate).mockResolvedValue({ _sum: { totalAmount: null, paidAmount: null } } as never);
    vi.mocked(prisma.quote.findMany).mockResolvedValue([
      {
        id: "quote-1",
        quoteNumber: "Q-00001",
        quoteDate: new Date("2026-08-10"),
        expiryDate: null,
        status: "SENT",
        subtotal: "100.00",
        discountAmount: "0.00",
        taxAmount: "0.00",
        totalAmount: "100.00",
        notes: null,
        terms: null,
        createdAt: new Date("2026-08-10"),
        customer: { id: "customer-1", name: "Ahmed Khan", companyName: null, email: null },
      },
    ] as never);
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([
      {
        id: "invoice-1",
        invoiceNumber: "INV-00001",
        invoiceDate: new Date("2026-08-10"),
        dueDate: null,
        quoteId: null,
        status: "UNPAID",
        subtotal: "200.00",
        discountAmount: "0.00",
        taxAmount: "0.00",
        totalAmount: "200.00",
        paidAmount: "0.00",
        paidDate: null,
        paymentNotes: null,
        notes: null,
        terms: null,
        createdAt: new Date("2026-08-10"),
        customer: { id: "customer-1", name: "Ahmed Khan", companyName: null, email: null },
        quote: null,
      },
    ] as never);

    const response = await GET();
    const body = await response.json();

    expect(body.data.recentQuotes[0].quoteNumber).toBe("Q-00001");
    expect(body.data.recentInvoices[0].invoiceNumber).toBe("INV-00001");
    expect(body.data.recentInvoices[0].remainingAmount).toBe("200.00");
  });
});

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { formatDecimal } from "./format-decimal";
import { serializeQuote } from "./serialize-quote";
import { serializeInvoice } from "./serialize-invoice";

// docs/API Specification.md sections 54-56. Shared by GET /api/v1/dashboard and the
// server-rendered dashboard page (Web Dev Standards section 46 — prefer direct data
// access for server-rendered pages over the page calling its own HTTP API) so the
// aggregation logic exists in exactly one place.
const RECENT_LIMIT = 5;
const CUSTOMER_SELECT = { id: true, name: true, companyName: true, email: true } as const;

export async function getDashboardData(userId: string) {
  const [totalQuotes, totalInvoices, invoiceTotals, recentQuotes, recentInvoices] = await prisma.$transaction([
    prisma.quote.count({ where: { userId } }),
    prisma.invoice.count({ where: { userId } }),
    prisma.invoice.aggregate({
      where: { userId },
      _sum: { totalAmount: true, paidAmount: true },
    }),
    prisma.quote.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: RECENT_LIMIT,
      include: { customer: { select: CUSTOMER_SELECT } },
    }),
    prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: RECENT_LIMIT,
      include: { customer: { select: CUSTOMER_SELECT }, quote: { select: { id: true, quoteNumber: true } } },
    }),
  ]);

  const paidAmount = invoiceTotals._sum.paidAmount ?? 0;
  const totalInvoiceAmount = invoiceTotals._sum.totalAmount ?? 0;

  return {
    totalQuotes,
    totalInvoices,
    paidAmount: formatDecimal(paidAmount),
    outstandingAmount: formatDecimal(new Prisma.Decimal(totalInvoiceAmount).minus(paidAmount)),
    recentQuotes: recentQuotes.map((quote) => serializeQuote(quote)),
    recentInvoices: recentInvoices.map((invoice) => serializeInvoice(invoice)),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

import type { Quote, QuoteItem, Customer } from "@prisma/client";
import { formatDecimal } from "./format-decimal";

// docs/API Specification.md sections 30-31. Shared by every Quotes route that
// returns a quote (list, detail, create, update, status change) so money/date
// formatting stays consistent — see lib/format-decimal.ts for why Decimal fields
// need explicit formatting rather than relying on toString()/toJSON().

const toDateOnly = (date: Date) => date.toISOString().slice(0, 10);

export function serializeQuoteItem(item: QuoteItem) {
  return {
    id: item.id,
    productId: item.productId,
    name: item.name,
    description: item.description,
    unit: item.unit,
    quantity: formatDecimal(item.quantity, 3),
    unitPrice: formatDecimal(item.unitPrice),
    discountAmount: formatDecimal(item.discountAmount),
    taxRate: formatDecimal(item.taxRate),
    taxAmount: formatDecimal(item.taxAmount),
    lineTotal: formatDecimal(item.lineTotal),
    sortOrder: item.sortOrder,
  };
}

type QuoteWithRelations = Quote & {
  items?: QuoteItem[];
  customer?: Pick<Customer, "id" | "name" | "companyName" | "email">;
};

export function serializeQuote(quote: QuoteWithRelations) {
  return {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    quoteDate: toDateOnly(quote.quoteDate),
    expiryDate: quote.expiryDate ? toDateOnly(quote.expiryDate) : null,
    status: quote.status,
    customer: quote.customer,
    items: quote.items?.map(serializeQuoteItem),
    subtotal: formatDecimal(quote.subtotal),
    discountAmount: formatDecimal(quote.discountAmount),
    taxAmount: formatDecimal(quote.taxAmount),
    totalAmount: formatDecimal(quote.totalAmount),
    notes: quote.notes,
    terms: quote.terms,
    createdAt: quote.createdAt.toISOString(),
  };
}

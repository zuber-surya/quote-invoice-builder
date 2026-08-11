import { Prisma, type Invoice, type InvoiceItem, type Customer } from "@prisma/client";
import { formatDecimal } from "./format-decimal";

// docs/API Specification.md sections 44-45. Shared by every Invoices route that
// returns an invoice (list, detail, create, update) plus the quote->invoice
// conversion endpoint. Mirrors lib/serialize-quote.ts — see its header comment for
// why Decimal fields need explicit formatting.

const toDateOnly = (date: Date) => date.toISOString().slice(0, 10);

export function serializeInvoiceItem(item: InvoiceItem) {
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

type InvoiceWithRelations = Invoice & {
  items?: InvoiceItem[];
  customer?: Pick<Customer, "id" | "name" | "companyName" | "email">;
  quote?: { id: string; quoteNumber: string } | null;
};

export function serializeInvoice(invoice: InvoiceWithRelations) {
  const remainingAmount = new Prisma.Decimal(invoice.totalAmount).minus(invoice.paidAmount);

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: toDateOnly(invoice.invoiceDate),
    dueDate: invoice.dueDate ? toDateOnly(invoice.dueDate) : null,
    status: invoice.status,
    customer: invoice.customer,
    quote: invoice.quote ?? (invoice.quoteId ? { id: invoice.quoteId } : null),
    items: invoice.items?.map(serializeInvoiceItem),
    subtotal: formatDecimal(invoice.subtotal),
    discountAmount: formatDecimal(invoice.discountAmount),
    taxAmount: formatDecimal(invoice.taxAmount),
    totalAmount: formatDecimal(invoice.totalAmount),
    paidAmount: formatDecimal(invoice.paidAmount),
    remainingAmount: remainingAmount.toFixed(2),
    paidDate: invoice.paidDate ? toDateOnly(invoice.paidDate) : null,
    paymentNotes: invoice.paymentNotes,
    notes: invoice.notes,
    terms: invoice.terms,
    createdAt: invoice.createdAt.toISOString(),
  };
}

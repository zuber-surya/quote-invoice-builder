import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiError, apiUnauthorized } from "@/lib/api-response";
import { formatDecimal } from "@/lib/format-decimal";
import { generateInvoicePdf } from "@/lib/pdf/generate-invoice-pdf";
import type { InvoicePdfData } from "@/lib/pdf/invoice-pdf-document";

// docs/API Specification.md section 50 (quote-equivalent to sections 39-40).
// Generated on demand, streamed directly — same no-object-storage approach as
// quotes/[id]/pdf/route.ts (see that file's header comment for rationale).

type RouteParams = { params: Promise<{ id: string }> };

const toDateOnly = (date: Date) => date.toISOString().slice(0, 10);

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    include: { items: { orderBy: { sortOrder: "asc" } }, customer: true },
  });
  if (!invoice) {
    return apiError("INVOICE_NOT_FOUND", "Invoice was not found.", 404);
  }

  const businessProfile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  if (!businessProfile) {
    return apiError("BUSINESS_PROFILE_NOT_FOUND", "Business profile has not been set up yet.", 404);
  }

  const remainingAmount = new Prisma.Decimal(invoice.totalAmount).minus(invoice.paidAmount);

  const data: InvoicePdfData = {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: toDateOnly(invoice.invoiceDate),
    dueDate: invoice.dueDate ? toDateOnly(invoice.dueDate) : null,
    status: invoice.status,
    items: invoice.items.map((item) => ({
      name: item.name,
      description: item.description,
      unit: item.unit,
      quantity: formatDecimal(item.quantity, 3),
      unitPrice: formatDecimal(item.unitPrice),
      discountAmount: formatDecimal(item.discountAmount),
      taxRate: formatDecimal(item.taxRate),
      lineTotal: formatDecimal(item.lineTotal),
    })),
    subtotal: formatDecimal(invoice.subtotal),
    discountAmount: formatDecimal(invoice.discountAmount),
    taxAmount: formatDecimal(invoice.taxAmount),
    totalAmount: formatDecimal(invoice.totalAmount),
    paidAmount: formatDecimal(invoice.paidAmount),
    remainingAmount: remainingAmount.toFixed(2),
    notes: invoice.notes,
    terms: invoice.terms,
    business: {
      name: businessProfile.businessName,
      logoUrl: businessProfile.logoUrl,
      address: businessProfile.address,
      city: businessProfile.city,
      state: businessProfile.state,
      country: businessProfile.country,
      postalCode: businessProfile.postalCode,
      email: businessProfile.email,
      phone: businessProfile.phone,
      taxNumber: businessProfile.taxNumber,
    },
    customer: {
      name: invoice.customer.name,
      companyName: invoice.customer.companyName,
      address: invoice.customer.address,
      city: invoice.customer.city,
      state: invoice.customer.state,
      country: invoice.customer.country,
      postalCode: invoice.customer.postalCode,
      email: invoice.customer.email,
      phone: invoice.customer.phone,
      taxNumber: invoice.customer.taxNumber,
    },
  };

  try {
    const pdfBuffer = await generateInvoicePdf(data);
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate invoice PDF:", error);
    return apiError("PDF_GENERATION_FAILED", "Unable to generate the invoice PDF.", 500);
  }
}

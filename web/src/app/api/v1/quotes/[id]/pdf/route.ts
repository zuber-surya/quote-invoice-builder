import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { apiError, apiUnauthorized } from "@/lib/api-response";
import { formatDecimal } from "@/lib/format-decimal";
import { generateQuotePdf } from "@/lib/pdf/generate-quote-pdf";
import type { QuotePdfData } from "@/lib/pdf/quote-pdf-document";

// docs/API Specification.md sections 39-40.
// Generated on demand, streamed directly — no persistent object storage for V1
// (Deployment & Infrastructure Spec section 33 recommends it for scale, but
// section 40 of the API Spec explicitly allows either approach for V1, and
// adding S3/R2 now would be a second, unrequested infrastructure dependency).

type RouteParams = { params: Promise<{ id: string }> };

const toDateOnly = (date: Date) => date.toISOString().slice(0, 10);

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const quote = await prisma.quote.findFirst({
    where: { id, userId: user.id },
    include: { items: { orderBy: { sortOrder: "asc" } }, customer: true },
  });
  if (!quote) {
    return apiError("QUOTE_NOT_FOUND", "Quote was not found.", 404);
  }

  const businessProfile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  if (!businessProfile) {
    return apiError("BUSINESS_PROFILE_NOT_FOUND", "Business profile has not been set up yet.", 404);
  }

  const data: QuotePdfData = {
    quoteNumber: quote.quoteNumber,
    quoteDate: toDateOnly(quote.quoteDate),
    expiryDate: quote.expiryDate ? toDateOnly(quote.expiryDate) : null,
    items: quote.items.map((item) => ({
      name: item.name,
      description: item.description,
      unit: item.unit,
      quantity: formatDecimal(item.quantity, 3),
      unitPrice: formatDecimal(item.unitPrice),
      discountAmount: formatDecimal(item.discountAmount),
      taxRate: formatDecimal(item.taxRate),
      lineTotal: formatDecimal(item.lineTotal),
    })),
    subtotal: formatDecimal(quote.subtotal),
    discountAmount: formatDecimal(quote.discountAmount),
    taxAmount: formatDecimal(quote.taxAmount),
    totalAmount: formatDecimal(quote.totalAmount),
    notes: quote.notes,
    terms: quote.terms,
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
      name: quote.customer.name,
      companyName: quote.customer.companyName,
      address: quote.customer.address,
      city: quote.customer.city,
      state: quote.customer.state,
      country: quote.customer.country,
      postalCode: quote.customer.postalCode,
      email: quote.customer.email,
      phone: quote.customer.phone,
      taxNumber: quote.customer.taxNumber,
    },
  };

  try {
    const pdfBuffer = await generateQuotePdf(data);
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${quote.quoteNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate quote PDF:", error);
    return apiError("PDF_GENERATION_FAILED", "Unable to generate the quote PDF.", 500);
  }
}

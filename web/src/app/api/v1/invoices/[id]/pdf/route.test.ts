import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    invoice: { findFirst: vi.fn() },
    businessProfile: { findUnique: vi.fn() },
  },
}));
vi.mock("@/lib/pdf/generate-invoice-pdf", () => ({ generateInvoicePdf: vi.fn() }));

import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/pdf/generate-invoice-pdf";
import { GET } from "./route";

const user = { id: "user-1", name: "Demo", email: "demo@example.com" };
const INVOICE_ID = "770e8400-e29b-41d4-a716-446655440003";

function params() {
  return { params: Promise.resolve({ id: INVOICE_ID }) };
}

const invoice = {
  id: INVOICE_ID,
  userId: "user-1",
  invoiceNumber: "INV-00001",
  invoiceDate: new Date("2026-08-10"),
  dueDate: new Date("2026-08-25"),
  status: "PARTIALLY_PAID",
  subtotal: "100.00",
  discountAmount: "0.00",
  taxAmount: "0.00",
  totalAmount: "100.00",
  paidAmount: "40.00",
  notes: null,
  terms: null,
  items: [],
  customer: {
    id: "customer-1",
    name: "Ahmed Khan",
    companyName: null,
    address: null,
    city: null,
    state: null,
    country: null,
    postalCode: null,
    email: null,
    phone: null,
    taxNumber: null,
  },
};

const businessProfile = {
  id: "profile-1",
  userId: "user-1",
  businessName: "Demo Business",
  logoUrl: null,
  address: null,
  city: null,
  state: null,
  country: null,
  postalCode: null,
  email: null,
  phone: null,
  taxNumber: null,
  bankAccountName: null,
  bankName: null,
  bankAccountNumber: null,
  ifscCode: null,
  swiftBicCode: null,
  lutNumber: null,
  lutDate: null,
  pdfShowQuantity: true,
  pdfShowUnitPrice: true,
  pdfShowDiscount: true,
  pdfShowTax: true,
  pdfShowSacCode: false,
  currency: "USD",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/invoices/:id/pdf", () => {
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
  });

  it("returns 404 when the business profile hasn't been set up", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(invoice as never);
    vi.mocked(prisma.businessProfile.findUnique).mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), params());

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("BUSINESS_PROFILE_NOT_FOUND");
  });

  it("streams a PDF with the correct headers on success", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(invoice as never);
    vi.mocked(prisma.businessProfile.findUnique).mockResolvedValue(businessProfile as never);
    vi.mocked(generateInvoicePdf).mockResolvedValue(Buffer.from("%PDF-1.7 fake"));

    const response = await GET(new Request("http://localhost"), params());

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain("INV-00001.pdf");
  });

  it("passes paid and remaining amounts to the renderer", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(invoice as never);
    vi.mocked(prisma.businessProfile.findUnique).mockResolvedValue(businessProfile as never);
    vi.mocked(generateInvoicePdf).mockResolvedValue(Buffer.from("%PDF-1.7 fake"));

    await GET(new Request("http://localhost"), params());

    expect(generateInvoicePdf).toHaveBeenCalledWith(
      expect.objectContaining({ status: "PARTIALLY_PAID", paidAmount: "40.00", remainingAmount: "60.00" })
    );
  });

  it("passes bank details, LUT, and PDF column settings through to the renderer", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(invoice as never);
    vi.mocked(prisma.businessProfile.findUnique).mockResolvedValue({
      ...businessProfile,
      bankAccountName: "Gajjar Ankit",
      bankName: "ICICI Bank",
      lutNumber: "AD2404260069519",
      lutDate: new Date("2026-04-02"),
      pdfShowSacCode: true,
    } as never);
    vi.mocked(generateInvoicePdf).mockResolvedValue(Buffer.from("%PDF-1.7 fake"));

    await GET(new Request("http://localhost"), params());

    expect(generateInvoicePdf).toHaveBeenCalledWith(
      expect.objectContaining({
        business: expect.objectContaining({
          bankAccountName: "Gajjar Ankit",
          bankName: "ICICI Bank",
          lutNumber: "AD2404260069519",
          lutDate: "2026-04-02",
          pdfShowSacCode: true,
        }),
      })
    );
  });

  it("returns 500 PDF_GENERATION_FAILED when rendering throws", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(invoice as never);
    vi.mocked(prisma.businessProfile.findUnique).mockResolvedValue(businessProfile as never);
    vi.mocked(generateInvoicePdf).mockRejectedValue(new Error("render failed"));

    const response = await GET(new Request("http://localhost"), params());

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe("PDF_GENERATION_FAILED");
  });
});

import { describe, expect, it } from "vitest";
import { invoiceSchema, invoiceListQuerySchema } from "./invoice";

const validItem = {
  name: "Website Development",
  unit: "Project",
  quantity: "1",
  unitPrice: "25000.00",
};

function validInvoice(overrides: Partial<Parameters<typeof invoiceSchema.safeParse>[0]> = {}) {
  return {
    customerId: "550e8400-e29b-41d4-a716-446655440000",
    invoiceDate: "2026-08-10",
    items: [validItem],
    ...overrides,
  };
}

describe("invoiceSchema", () => {
  it("accepts a minimal valid invoice", () => {
    expect(invoiceSchema.safeParse(validInvoice()).success).toBe(true);
  });

  it("requires a customerId", () => {
    expect(invoiceSchema.safeParse(validInvoice({ customerId: undefined })).success).toBe(false);
  });

  it("requires invoiceDate in YYYY-MM-DD format", () => {
    expect(invoiceSchema.safeParse(validInvoice({ invoiceDate: "08/10/2026" })).success).toBe(false);
  });

  it("requires at least one item", () => {
    expect(invoiceSchema.safeParse(validInvoice({ items: [] })).success).toBe(false);
  });

  it("converts a blank dueDate to null", () => {
    const result = invoiceSchema.safeParse(validInvoice({ dueDate: "" }));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.dueDate).toBeNull();
  });

  it("rejects a zero-quantity item", () => {
    const result = invoiceSchema.safeParse(validInvoice({ items: [{ ...validItem, quantity: "0" }] }));
    expect(result.success).toBe(false);
  });
});

describe("invoiceListQuerySchema", () => {
  it("defaults page, pageSize, sortBy, sortOrder", () => {
    const result = invoiceListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
      expect(result.data.sortBy).toBe("createdAt");
      expect(result.data.sortOrder).toBe("desc");
    }
  });

  it("accepts a valid status filter", () => {
    expect(invoiceListQuerySchema.safeParse({ status: "PARTIALLY_PAID" }).success).toBe(true);
  });

  it("rejects a quote-only status value", () => {
    expect(invoiceListQuerySchema.safeParse({ status: "SENT" }).success).toBe(false);
  });
});

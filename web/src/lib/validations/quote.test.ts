import { describe, expect, it } from "vitest";
import { quoteSchema, quoteStatusSchema, quoteListQuerySchema } from "./quote";

const validItem = {
  name: "Website Development",
  unit: "Project",
  quantity: "1",
  unitPrice: "25000.00",
};

function validQuote(overrides: Partial<Parameters<typeof quoteSchema.safeParse>[0]> = {}) {
  return {
    customerId: "550e8400-e29b-41d4-a716-446655440000",
    quoteDate: "2026-08-10",
    items: [validItem],
    ...overrides,
  };
}

describe("quoteSchema", () => {
  it("accepts a minimal valid quote", () => {
    const result = quoteSchema.safeParse(validQuote());
    expect(result.success).toBe(true);
  });

  it("requires a customerId", () => {
    const result = quoteSchema.safeParse(validQuote({ customerId: undefined }));
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid customerId", () => {
    const result = quoteSchema.safeParse(validQuote({ customerId: "not-a-uuid" }));
    expect(result.success).toBe(false);
  });

  it("requires quoteDate in YYYY-MM-DD format", () => {
    const result = quoteSchema.safeParse(validQuote({ quoteDate: "08/10/2026" }));
    expect(result.success).toBe(false);
  });

  it("requires at least one item", () => {
    const result = quoteSchema.safeParse(validQuote({ items: [] }));
    expect(result.success).toBe(false);
  });

  it("rejects a zero quantity item", () => {
    const result = quoteSchema.safeParse(validQuote({ items: [{ ...validItem, quantity: "0" }] }));
    expect(result.success).toBe(false);
  });

  it("rejects a negative unit price", () => {
    const result = quoteSchema.safeParse(validQuote({ items: [{ ...validItem, unitPrice: "-5.00" }] }));
    expect(result.success).toBe(false);
  });

  it("rejects a tax rate above 100", () => {
    const result = quoteSchema.safeParse(validQuote({ items: [{ ...validItem, taxRate: "150.00" }] }));
    expect(result.success).toBe(false);
  });

  it("defaults item discountAmount and taxRate to 0.00", () => {
    const result = quoteSchema.safeParse(validQuote());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0].discountAmount).toBe("0.00");
      expect(result.data.items[0].taxRate).toBe("0.00");
    }
  });

  it("converts a blank expiryDate to null", () => {
    const result = quoteSchema.safeParse(validQuote({ expiryDate: "" }));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.expiryDate).toBeNull();
  });

  it("accepts an item without a productId", () => {
    const result = quoteSchema.safeParse(validQuote());
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.items[0].productId).toBeUndefined();
  });
});

describe("quoteStatusSchema", () => {
  it("accepts SENT, ACCEPTED, REJECTED, EXPIRED", () => {
    for (const status of ["SENT", "ACCEPTED", "REJECTED", "EXPIRED"]) {
      expect(quoteStatusSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("rejects DRAFT as a target status", () => {
    expect(quoteStatusSchema.safeParse({ status: "DRAFT" }).success).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(quoteStatusSchema.safeParse({ status: "CANCELLED" }).success).toBe(false);
  });
});

describe("quoteListQuerySchema", () => {
  it("defaults page, pageSize, sortBy, sortOrder", () => {
    const result = quoteListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
      expect(result.data.sortBy).toBe("createdAt");
      expect(result.data.sortOrder).toBe("desc");
    }
  });

  it("accepts a status filter", () => {
    const result = quoteListQuerySchema.safeParse({ status: "SENT" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status filter", () => {
    const result = quoteListQuerySchema.safeParse({ status: "BOGUS" });
    expect(result.success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { documentItemSchema } from "./document-item";

const validItem = {
  name: "Website Development",
  unit: "Project",
  quantity: "1",
  unitPrice: "25000.00",
};

describe("documentItemSchema", () => {
  it("accepts a minimal valid item", () => {
    expect(documentItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("requires a name", () => {
    expect(documentItemSchema.safeParse({ ...validItem, name: "" }).success).toBe(false);
  });

  it("requires a unit", () => {
    expect(documentItemSchema.safeParse({ ...validItem, unit: "" }).success).toBe(false);
  });

  it("rejects a zero quantity", () => {
    expect(documentItemSchema.safeParse({ ...validItem, quantity: "0" }).success).toBe(false);
  });

  it("rejects a negative unit price", () => {
    expect(documentItemSchema.safeParse({ ...validItem, unitPrice: "-5.00" }).success).toBe(false);
  });

  it("rejects a tax rate above 100", () => {
    expect(documentItemSchema.safeParse({ ...validItem, taxRate: "150.00" }).success).toBe(false);
  });

  it("defaults discountAmount and taxRate to 0.00", () => {
    const result = documentItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discountAmount).toBe("0.00");
      expect(result.data.taxRate).toBe("0.00");
    }
  });

  it("accepts an item without a productId", () => {
    const result = documentItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.productId).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { productSchema, productListQuerySchema } from "./product";

describe("productSchema", () => {
  it("requires a product name", () => {
    const result = productSchema.safeParse({ name: "", unit: "Project", price: "100.00" });
    expect(result.success).toBe(false);
  });

  it("requires a unit", () => {
    const result = productSchema.safeParse({ name: "Website", unit: "", price: "100.00" });
    expect(result.success).toBe(false);
  });

  it("requires a price", () => {
    const result = productSchema.safeParse({ name: "Website", unit: "Project" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative price", () => {
    const result = productSchema.safeParse({ name: "Website", unit: "Project", price: "-10.00" });
    expect(result.success).toBe(false);
  });

  it("rejects a price with more than 2 decimal places", () => {
    const result = productSchema.safeParse({ name: "Website", unit: "Project", price: "100.999" });
    expect(result.success).toBe(false);
  });

  it("defaults taxRate to 0.00 when omitted", () => {
    const result = productSchema.safeParse({ name: "Website", unit: "Project", price: "100.00" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.taxRate).toBe("0.00");
  });

  it("rejects a taxRate above 100", () => {
    const result = productSchema.safeParse({
      name: "Website",
      unit: "Project",
      price: "100.00",
      taxRate: "150.00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative taxRate", () => {
    const result = productSchema.safeParse({
      name: "Website",
      unit: "Project",
      price: "100.00",
      taxRate: "-5.00",
    });
    expect(result.success).toBe(false);
  });

  it("converts blank description to null instead of empty string", () => {
    const result = productSchema.safeParse({
      name: "Website",
      unit: "Project",
      price: "100.00",
      description: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toBeNull();
  });

  it("accepts a fully populated product", () => {
    const result = productSchema.safeParse({
      name: "Website Development",
      description: "Business website development",
      unit: "Project",
      price: "25000.00",
      taxRate: "18.00",
    });
    expect(result.success).toBe(true);
  });

  it("preserves the exact decimal string rather than reparsing it", () => {
    const result = productSchema.safeParse({
      name: "Consulting",
      unit: "Hour",
      price: "999.10",
      taxRate: "5.00",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe("999.10");
      expect(result.data.taxRate).toBe("5.00");
    }
  });
});

describe("productListQuerySchema", () => {
  it("defaults page, pageSize, sortBy, sortOrder", () => {
    const result = productListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
      expect(result.data.sortBy).toBe("createdAt");
      expect(result.data.sortOrder).toBe("desc");
    }
  });

  it("caps pageSize at 100", () => {
    const result = productListQuerySchema.safeParse({ pageSize: "500" });
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported sortBy field", () => {
    const result = productListQuerySchema.safeParse({ sortBy: "price" });
    expect(result.success).toBe(false);
  });
});

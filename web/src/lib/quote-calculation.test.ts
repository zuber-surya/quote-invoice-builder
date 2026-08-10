import { describe, expect, it } from "vitest";
import { calculateQuoteItem, calculateQuoteTotals } from "./quote-calculation";

describe("calculateQuoteItem", () => {
  it("matches API Specification section 76 Test 2 exactly", () => {
    const result = calculateQuoteItem({
      quantity: "2",
      unitPrice: "10000.00",
      discountAmount: "1000.00",
      taxRate: "18.00",
    });
    // gross 20000, discounted 19000, tax 3420, lineTotal 22420
    expect(result.taxAmount).toBe("3420.00");
    expect(result.lineTotal).toBe("22420.00");
  });

  it("handles zero discount", () => {
    const result = calculateQuoteItem({
      quantity: "1",
      unitPrice: "100.00",
      discountAmount: "0.00",
      taxRate: "18.00",
    });
    expect(result.taxAmount).toBe("18.00");
    expect(result.lineTotal).toBe("118.00");
  });

  it("handles zero tax", () => {
    const result = calculateQuoteItem({
      quantity: "1",
      unitPrice: "100.00",
      discountAmount: "10.00",
      taxRate: "0.00",
    });
    expect(result.taxAmount).toBe("0.00");
    expect(result.lineTotal).toBe("90.00");
  });

  it("handles fractional quantities", () => {
    const result = calculateQuoteItem({
      quantity: "2.5",
      unitPrice: "100.00",
      discountAmount: "0.00",
      taxRate: "10.00",
    });
    // gross 250.00, tax 25.00, lineTotal 275.00
    expect(result.taxAmount).toBe("25.00");
    expect(result.lineTotal).toBe("275.00");
  });

  it("rounds tax half-up to 2 decimal places", () => {
    const result = calculateQuoteItem({
      quantity: "1",
      unitPrice: "10.005",
      discountAmount: "0.00",
      taxRate: "10.00",
    });
    // gross rounds to 10.01 (half-up), tax = 10.01 * 10% = 1.001 -> 1.00
    expect(result.taxAmount).toBe("1.00");
  });
});

describe("calculateQuoteTotals", () => {
  it("sums a single item to match its own totals", () => {
    const { totals } = calculateQuoteTotals([
      { quantity: "2", unitPrice: "10000.00", discountAmount: "1000.00", taxRate: "18.00" },
    ]);
    expect(totals).toEqual({
      subtotal: "20000.00",
      discountAmount: "1000.00",
      taxAmount: "3420.00",
      totalAmount: "22420.00",
    });
  });

  it("sums multiple items with different discounts and tax rates", () => {
    const { items, totals } = calculateQuoteTotals([
      { quantity: "1", unitPrice: "100.00", discountAmount: "0.00", taxRate: "18.00" },
      { quantity: "3", unitPrice: "50.00", discountAmount: "10.00", taxRate: "5.00" },
    ]);

    // item 1: gross 100, tax 18, lineTotal 118
    // item 2: gross 150, discounted 140, tax 7, lineTotal 147
    expect(items[0].lineTotal).toBe("118.00");
    expect(items[1].lineTotal).toBe("147.00");

    expect(totals).toEqual({
      subtotal: "250.00",
      discountAmount: "10.00",
      taxAmount: "25.00",
      totalAmount: "265.00",
    });
  });

  it("returns zeroed totals for an empty item list", () => {
    const { items, totals } = calculateQuoteTotals([]);
    expect(items).toEqual([]);
    expect(totals).toEqual({
      subtotal: "0.00",
      discountAmount: "0.00",
      taxAmount: "0.00",
      totalAmount: "0.00",
    });
  });
});

import { describe, expect, it } from "vitest";
import { decimalString, optionalDecimalString } from "./decimal";

describe("decimalString", () => {
  const price = decimalString({ label: "Price", min: 0 });

  it("accepts a valid amount", () => {
    expect(price.safeParse("100.50").success).toBe(true);
  });

  it("rejects more decimal places than allowed", () => {
    expect(price.safeParse("100.505").success).toBe(false);
  });

  it("rejects values below the minimum", () => {
    expect(price.safeParse("-1.00").success).toBe(false);
  });

  it("enforces both bounds when given", () => {
    const taxRate = decimalString({ label: "Tax rate", min: 0, max: 100 });
    expect(taxRate.safeParse("150.00").success).toBe(false);
    expect(taxRate.safeParse("-5.00").success).toBe(false);
    expect(taxRate.safeParse("18.00").success).toBe(true);
  });

  it("respects a custom decimal place count", () => {
    const quantity = decimalString({ label: "Quantity", maxDecimalPlaces: 3, min: 0.001 });
    expect(quantity.safeParse("2.500").success).toBe(true);
    expect(quantity.safeParse("2.5000").success).toBe(false);
  });
});

describe("optionalDecimalString", () => {
  it("falls back to the default when blank", () => {
    const taxRate = optionalDecimalString({ label: "Tax rate", min: 0, max: 100, defaultValue: "0.00" });
    const result = taxRate.safeParse("");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("0.00");
  });

  it("falls back to the default when omitted", () => {
    const taxRate = optionalDecimalString({ label: "Tax rate", min: 0, max: 100, defaultValue: "0.00" });
    const result = taxRate.safeParse(undefined);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("0.00");
  });

  it("still validates a provided value", () => {
    const taxRate = optionalDecimalString({ label: "Tax rate", min: 0, max: 100, defaultValue: "0.00" });
    expect(taxRate.safeParse("150.00").success).toBe(false);
  });
});

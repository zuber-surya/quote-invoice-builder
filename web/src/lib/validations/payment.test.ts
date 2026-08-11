import { describe, expect, it } from "vitest";
import { paymentSchema } from "./payment";

describe("paymentSchema", () => {
  it("accepts a minimal valid payment", () => {
    expect(paymentSchema.safeParse({ amount: "100.00" }).success).toBe(true);
  });

  it("rejects a zero amount", () => {
    expect(paymentSchema.safeParse({ amount: "0.00" }).success).toBe(false);
  });

  it("rejects a negative amount", () => {
    expect(paymentSchema.safeParse({ amount: "-10.00" }).success).toBe(false);
  });

  it("rejects a malformed payment date", () => {
    expect(paymentSchema.safeParse({ amount: "10.00", paymentDate: "10/08/2026" }).success).toBe(false);
  });

  it("accepts an optional payment date and notes", () => {
    const result = paymentSchema.safeParse({ amount: "10.00", paymentDate: "2026-08-10", notes: "Cash" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.paymentDate).toBe("2026-08-10");
      expect(result.data.notes).toBe("Cash");
    }
  });

  it("converts blank notes to null", () => {
    const result = paymentSchema.safeParse({ amount: "10.00", notes: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.notes).toBeNull();
  });
});

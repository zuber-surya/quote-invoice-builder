import { describe, expect, it } from "vitest";
import { amountInWords } from "./amount-in-words";

describe("amountInWords", () => {
  it("spells a whole-dollar amount matching the sample invoice", () => {
    expect(amountInWords("3000.00", "USD")).toBe("Three Thousand US Dollars Only");
  });

  it("includes the minor unit when cents are present", () => {
    expect(amountInWords("1250.75", "USD")).toBe("One Thousand Two Hundred Fifty US Dollars and Seventy Five Cents Only");
  });

  it("handles zero", () => {
    expect(amountInWords("0.00", "USD")).toBe("Zero US Dollars Only");
  });

  it("handles large amounts across multiple scale groups", () => {
    expect(amountInWords("1000000.00", "INR")).toBe("One Million Rupees Only");
  });

  it("falls back to the raw currency code for unmapped currencies", () => {
    expect(amountInWords("500.00", "AUD")).toBe("Five Hundred AUD Only");
  });
});

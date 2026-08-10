import { describe, expect, it } from "vitest";
import { formatDecimal } from "./format-decimal";

describe("formatDecimal", () => {
  it("pads whole numbers to 2 decimal places", () => {
    expect(formatDecimal("25000")).toBe("25000.00");
    expect(formatDecimal(18)).toBe("18.00");
  });

  it("preserves existing 2-decimal values", () => {
    expect(formatDecimal("999.10")).toBe("999.10");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatDecimal("10.005")).toBe("10.01");
  });

  it("supports a custom decimal place count for quantity columns", () => {
    expect(formatDecimal("2.5", 3)).toBe("2.500");
    expect(formatDecimal("10", 3)).toBe("10.000");
  });
});

import { describe, expect, it } from "vitest";
import { getNextDocumentNumber } from "./document-number";

describe("getNextDocumentNumber", () => {
  it("starts at 1 when there is no prior document", () => {
    expect(getNextDocumentNumber(null, "Q")).toBe("Q-00001");
    expect(getNextDocumentNumber(null, "INV")).toBe("INV-00001");
  });

  it("increments from the last document number", () => {
    expect(getNextDocumentNumber("Q-00021", "Q")).toBe("Q-00022");
    expect(getNextDocumentNumber("INV-00007", "INV")).toBe("INV-00008");
  });

  it("pads to 5 digits", () => {
    expect(getNextDocumentNumber("Q-00099", "Q")).toBe("Q-00100");
  });

  it("does not pad beyond 5 digits once the sequence exceeds it", () => {
    expect(getNextDocumentNumber("Q-99999", "Q")).toBe("Q-100000");
  });

  it("does not confuse a quote number for an invoice number given a different prefix", () => {
    // A stray non-matching prefix should be treated as "no prior document."
    expect(getNextDocumentNumber("Q-00050", "INV")).toBe("INV-00001");
  });
});

import { describe, expect, it } from "vitest";
import { getNextQuoteNumber } from "./quote-number";

function stubDb(lastQuoteNumber: string | null) {
  return {
    quote: {
      findFirst: async () => (lastQuoteNumber ? { quoteNumber: lastQuoteNumber } : null),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("getNextQuoteNumber", () => {
  it("starts at Q-00001 when the user has no quotes yet", async () => {
    const number = await getNextQuoteNumber(stubDb(null), "user-1");
    expect(number).toBe("Q-00001");
  });

  it("increments from the most recently created quote", async () => {
    const number = await getNextQuoteNumber(stubDb("Q-00021"), "user-1");
    expect(number).toBe("Q-00022");
  });

  it("pads to 5 digits", async () => {
    const number = await getNextQuoteNumber(stubDb("Q-00099"), "user-1");
    expect(number).toBe("Q-00100");
  });

  it("does not pad beyond 5 digits once the sequence exceeds it", async () => {
    const number = await getNextQuoteNumber(stubDb("Q-99999"), "user-1");
    expect(number).toBe("Q-100000");
  });
});

import { describe, expect, it } from "vitest";
import { businessProfileSchema } from "./business-profile";

describe("businessProfileSchema", () => {
  it("requires a business name", () => {
    const result = businessProfileSchema.safeParse({ businessName: "", currency: "INR" });
    expect(result.success).toBe(false);
  });

  it("defaults currency to INR when omitted", () => {
    const result = businessProfileSchema.safeParse({ businessName: "Demo Business" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("INR");
    }
  });

  it("uppercases and validates the currency code length", () => {
    const valid = businessProfileSchema.safeParse({ businessName: "Demo", currency: "inr" });
    expect(valid.success).toBe(true);
    if (valid.success) expect(valid.data.currency).toBe("INR");

    const invalid = businessProfileSchema.safeParse({ businessName: "Demo", currency: "INRR" });
    expect(invalid.success).toBe(false);
  });

  it("converts blank optional fields to null instead of empty strings", () => {
    const result = businessProfileSchema.safeParse({
      businessName: "Demo",
      ownerName: "",
      email: "",
      website: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ownerName).toBeNull();
      expect(result.data.email).toBeNull();
      expect(result.data.website).toBeNull();
    }
  });

  it("rejects an invalid email address", () => {
    const result = businessProfileSchema.safeParse({
      businessName: "Demo",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a website without a protocol", () => {
    const result = businessProfileSchema.safeParse({
      businessName: "Demo",
      website: "example.com",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a fully populated profile", () => {
    const result = businessProfileSchema.safeParse({
      businessName: "Demo Business",
      ownerName: "Demo Owner",
      email: "owner@example.com",
      phone: "+91 9999999999",
      address: "123 Main St",
      city: "Rajula",
      state: "Gujarat",
      country: "India",
      postalCode: "365560",
      taxNumber: "GST123",
      website: "https://example.com",
      logoUrl: "https://example.com/logo.png",
      currency: "inr",
    });
    expect(result.success).toBe(true);
  });
});

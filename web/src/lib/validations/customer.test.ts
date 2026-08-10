import { describe, expect, it } from "vitest";
import { customerSchema, customerListQuerySchema } from "./customer";

describe("customerSchema", () => {
  it("requires a customer name", () => {
    const result = customerSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("accepts a name-only customer", () => {
    const result = customerSchema.safeParse({ name: "Ahmed Khan" });
    expect(result.success).toBe(true);
  });

  it("converts blank optional fields to null instead of empty strings", () => {
    const result = customerSchema.safeParse({
      name: "Ahmed Khan",
      companyName: "",
      email: "",
      phone: "",
      notes: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyName).toBeNull();
      expect(result.data.email).toBeNull();
      expect(result.data.phone).toBeNull();
      expect(result.data.notes).toBeNull();
    }
  });

  it("rejects an invalid email address", () => {
    const result = customerSchema.safeParse({
      name: "Ahmed Khan",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a fully populated customer", () => {
    const result = customerSchema.safeParse({
      name: "Ahmed Khan",
      companyName: "Ahmed Traders",
      email: "ahmed@example.com",
      phone: "+91 9999999999",
      address: "Main Road",
      city: "Rajula",
      state: "Gujarat",
      country: "India",
      postalCode: "365560",
      taxNumber: "GST123",
      notes: "Regular customer",
    });
    expect(result.success).toBe(true);
  });
});

describe("customerListQuerySchema", () => {
  it("defaults page, pageSize, sortBy, sortOrder", () => {
    const result = customerListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
      expect(result.data.sortBy).toBe("createdAt");
      expect(result.data.sortOrder).toBe("desc");
    }
  });

  it("caps pageSize at 100", () => {
    const result = customerListQuerySchema.safeParse({ pageSize: "500" });
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported sortBy field", () => {
    const result = customerListQuerySchema.safeParse({ sortBy: "email" });
    expect(result.success).toBe(false);
  });
});

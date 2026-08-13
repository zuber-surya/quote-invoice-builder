import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: vi.fn() } } }));
vi.mock("bcryptjs", () => ({ default: { compare: vi.fn() } }));

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authorizeCredentials } from "./authorize-credentials";

const storedUser = {
  id: "user-1",
  name: "Demo",
  email: "demo@example.com",
  passwordHash: "hashed-password",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authorizeCredentials", () => {
  it("returns null for missing credentials", async () => {
    const result = await authorizeCredentials(undefined);
    expect(result).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null for an invalid email", async () => {
    const result = await authorizeCredentials({ email: "not-an-email", password: "whatever" });
    expect(result).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null for an empty password", async () => {
    const result = await authorizeCredentials({ email: "demo@example.com", password: "" });
    expect(result).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null for an unknown email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await authorizeCredentials({ email: "nobody@example.com", password: "correct-password" });

    expect(result).toBeNull();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it("returns null for an invalid password", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(storedUser as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const result = await authorizeCredentials({ email: "demo@example.com", password: "wrong-password" });

    expect(result).toBeNull();
    expect(bcrypt.compare).toHaveBeenCalledWith("wrong-password", "hashed-password");
  });

  it("returns the user (without the password hash) for a valid login", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(storedUser as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await authorizeCredentials({ email: "demo@example.com", password: "correct-password" });

    expect(result).toEqual({ id: "user-1", name: "Demo", email: "demo@example.com" });
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("normalizes email casing/whitespace the same way the schema does", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(storedUser as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await authorizeCredentials({ email: "  Demo@Example.com  ", password: "correct-password" });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "demo@example.com" } });
  });
});

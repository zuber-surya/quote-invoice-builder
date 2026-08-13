import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: vi.fn(), create: vi.fn() } } }));
vi.mock("bcryptjs", () => ({ default: { hash: vi.fn() } }));

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { POST } from "./route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = { name: "Ahmed Khan", email: "ahmed@example.com", password: "correct-password" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/register", () => {
  it("rejects a missing name", async () => {
    const response = await POST(jsonRequest({ email: "ahmed@example.com", password: "correct-password" }));
    expect(response.status).toBe(400);
  });

  it("rejects an invalid email", async () => {
    const response = await POST(jsonRequest({ ...validBody, email: "not-an-email" }));
    expect(response.status).toBe(400);
  });

  it("rejects a password under 8 characters", async () => {
    const response = await POST(jsonRequest({ ...validBody, password: "short" }));
    expect(response.status).toBe(400);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 409 when the email is already registered", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "existing-user" } as never);

    const response = await POST(jsonRequest(validBody));

    expect(response.status).toBe(409);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("hashes the password and never returns it in the response", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user-1",
      name: "Ahmed Khan",
      email: "ahmed@example.com",
    } as never);

    const response = await POST(jsonRequest(validBody));

    expect(response.status).toBe(201);
    expect(bcrypt.hash).toHaveBeenCalledWith("correct-password", 12);
    const createCall = vi.mocked(prisma.user.create).mock.calls[0][0];
    expect(createCall.data).toMatchObject({ passwordHash: "hashed-password" });

    const body = await response.json();
    expect(body.user).toEqual({ id: "user-1", name: "Ahmed Khan", email: "ahmed@example.com" });
    expect(JSON.stringify(body)).not.toContain("password");
  });

  it("returns 500 without leaking internal error details on unexpected failure", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
    vi.mocked(prisma.user.create).mockRejectedValue(new Error("db unreachable at 10.0.0.5:5432"));

    const response = await POST(jsonRequest(validBody));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(JSON.stringify(body)).not.toContain("10.0.0.5");
  });
});

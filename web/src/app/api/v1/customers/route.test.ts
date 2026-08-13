import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    customer: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "./route";

const user = { id: "user-1", name: "Demo", email: "demo@example.com" };
const otherUser = { id: "user-2", name: "Other", email: "other@example.com" };

function jsonRequest(url: string, body: unknown, method = "POST") {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.$transaction).mockImplementation((arg: unknown) =>
    Array.isArray(arg) ? Promise.all(arg) : (arg as (tx: typeof prisma) => Promise<unknown>)(prisma)
  );
});

describe("GET /api/v1/customers", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET(new Request("http://localhost/api/v1/customers"));
    expect(response.status).toBe(401);
  });

  it("scopes the list query to the authenticated user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findMany).mockResolvedValue([]);
    vi.mocked(prisma.customer.count).mockResolvedValue(0);

    await GET(new Request("http://localhost/api/v1/customers"));

    const call = vi.mocked(prisma.customer.findMany).mock.calls[0][0];
    expect(call?.where).toMatchObject({ userId: "user-1" });
  });

  it("never returns another user's customers even if present in the mocked data", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(otherUser);
    vi.mocked(prisma.customer.findMany).mockResolvedValue([]);
    vi.mocked(prisma.customer.count).mockResolvedValue(0);

    await GET(new Request("http://localhost/api/v1/customers"));

    const call = vi.mocked(prisma.customer.findMany).mock.calls[0][0];
    expect(call?.where).toMatchObject({ userId: "user-2" });
  });

  it("applies the search filter", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findMany).mockResolvedValue([]);
    vi.mocked(prisma.customer.count).mockResolvedValue(0);

    await GET(new Request("http://localhost/api/v1/customers?search=Ahmed"));

    const call = vi.mocked(prisma.customer.findMany).mock.calls[0][0];
    expect(call?.where).toMatchObject({ userId: "user-1" });
    expect(JSON.stringify(call?.where)).toContain("Ahmed");
  });

  it("rejects an invalid pageSize", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await GET(new Request("http://localhost/api/v1/customers?pageSize=0"));
    expect(response.status).toBe(400);
  });
});

describe("POST /api/v1/customers", () => {
  const validBody = { name: "Ahmed Khan", email: "ahmed@example.com" };

  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await POST(jsonRequest("http://localhost/api/v1/customers", validBody));
    expect(response.status).toBe(401);
  });

  it("rejects an invalid body — missing required name", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await POST(jsonRequest("http://localhost/api/v1/customers", { email: "ahmed@example.com" }));
    expect(response.status).toBe(400);
  });

  it("rejects an invalid email", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await POST(
      jsonRequest("http://localhost/api/v1/customers", { name: "Ahmed Khan", email: "not-an-email" })
    );
    expect(response.status).toBe(400);
  });

  it("creates a customer scoped to the authenticated user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.create).mockImplementation((args) =>
      Promise.resolve({ id: "customer-1", ...args.data }) as never
    );

    const response = await POST(jsonRequest("http://localhost/api/v1/customers", validBody));

    expect(response.status).toBe(201);
    const createCall = vi.mocked(prisma.customer.create).mock.calls[0][0];
    expect(createCall.data).toMatchObject({ userId: "user-1", name: "Ahmed Khan" });
  });
});

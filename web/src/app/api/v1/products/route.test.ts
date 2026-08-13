import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
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

describe("GET /api/v1/products", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET(new Request("http://localhost/api/v1/products"));
    expect(response.status).toBe(401);
  });

  it("scopes the list query to the authenticated user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(0);

    await GET(new Request("http://localhost/api/v1/products"));

    const call = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    expect(call?.where).toMatchObject({ userId: "user-1" });
  });

  it("never returns another user's products even if present in the mocked data", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(otherUser);
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(0);

    await GET(new Request("http://localhost/api/v1/products"));

    const call = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    expect(call?.where).toMatchObject({ userId: "user-2" });
  });

  it("applies the search filter", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(0);

    await GET(new Request("http://localhost/api/v1/products?search=Hosting"));

    const call = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    expect(JSON.stringify(call?.where)).toContain("Hosting");
  });

  it("formats price and taxRate as decimal strings", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: "p1", userId: "user-1", name: "Hosting", price: "5000", taxRate: "18" },
    ] as never);
    vi.mocked(prisma.product.count).mockResolvedValue(1);

    const response = await GET(new Request("http://localhost/api/v1/products"));
    const body = await response.json();
    expect(body.data[0].price).toBe("5000.00");
    expect(body.data[0].taxRate).toBe("18.00");
  });
});

describe("POST /api/v1/products", () => {
  const validBody = { name: "Hosting", unit: "Month", price: "5000.00" };

  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await POST(jsonRequest("http://localhost/api/v1/products", validBody));
    expect(response.status).toBe(401);
  });

  it("rejects an invalid body — missing required unit", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await POST(jsonRequest("http://localhost/api/v1/products", { name: "Hosting", price: "5000.00" }));
    expect(response.status).toBe(400);
  });

  it("rejects a negative price", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await POST(
      jsonRequest("http://localhost/api/v1/products", { name: "Hosting", unit: "Month", price: "-1.00" })
    );
    expect(response.status).toBe(400);
  });

  it("rejects a taxRate above 100", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await POST(
      jsonRequest("http://localhost/api/v1/products", { ...validBody, taxRate: "150.00" })
    );
    expect(response.status).toBe(400);
  });

  it("creates a product scoped to the authenticated user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.product.create).mockImplementation((args) =>
      Promise.resolve({ id: "product-1", ...args.data }) as never
    );

    const response = await POST(jsonRequest("http://localhost/api/v1/products", validBody));

    expect(response.status).toBe(201);
    const createCall = vi.mocked(prisma.product.create).mock.calls[0][0];
    expect(createCall.data).toMatchObject({ userId: "user-1", name: "Hosting" });
  });
});

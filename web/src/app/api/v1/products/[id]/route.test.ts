import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findFirst: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { GET, PUT, DELETE } from "./route";

const user = { id: "user-1", name: "Demo", email: "demo@example.com" };
const PRODUCT_ID = "660e8400-e29b-41d4-a716-446655440002";

function params(id = PRODUCT_ID) {
  return { params: Promise.resolve({ id }) };
}

function jsonRequest(body: unknown, method = "PUT") {
  return new Request(`http://localhost/api/v1/products/${PRODUCT_ID}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const ownedProduct = { id: PRODUCT_ID, userId: "user-1", name: "Hosting", price: "5000.00", taxRate: "18.00" };
const validBody = { name: "Hosting Updated", unit: "Month", price: "6000.00" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/products/:id", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET(new Request("http://localhost"), params());
    expect(response.status).toBe(401);
  });

  it("returns 404 (not 403) when the product isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), params());

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("PRODUCT_NOT_FOUND");
    const call = vi.mocked(prisma.product.findFirst).mock.calls[0][0];
    expect(call?.where).toMatchObject({ id: PRODUCT_ID, userId: "user-1" });
  });

  it("returns the product with formatted money fields when owned", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.product.findFirst).mockResolvedValue(ownedProduct as never);

    const response = await GET(new Request("http://localhost"), params());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.price).toBe("5000.00");
  });
});

describe("PUT /api/v1/products/:id", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await PUT(jsonRequest(validBody), params());
    expect(response.status).toBe(401);
  });

  it("rejects an invalid body", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await PUT(jsonRequest({ name: "", unit: "Month", price: "1.00" }), params());
    expect(response.status).toBe(400);
  });

  it("returns 404 when the product isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

    const response = await PUT(jsonRequest(validBody), params());
    expect(response.status).toBe(404);
  });

  it("updates the product when owned", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.product.findFirst).mockResolvedValue(ownedProduct as never);
    vi.mocked(prisma.product.update).mockResolvedValue({ ...ownedProduct, ...validBody } as never);

    const response = await PUT(jsonRequest(validBody), params());

    expect(response.status).toBe(200);
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID },
      data: expect.objectContaining({ name: "Hosting Updated" }),
    });
  });
});

describe("DELETE /api/v1/products/:id", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());
    expect(response.status).toBe(401);
  });

  it("returns 404 when the product isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());
    expect(response.status).toBe(404);
  });

  it("deletes a product regardless of prior document references (SetNull on delete)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.product.findFirst).mockResolvedValue(ownedProduct as never);
    vi.mocked(prisma.product.delete).mockResolvedValue(ownedProduct as never);

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());

    expect(response.status).toBe(200);
    expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: PRODUCT_ID } });
  });
});

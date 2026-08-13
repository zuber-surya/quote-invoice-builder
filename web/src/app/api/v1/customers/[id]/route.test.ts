import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/get-current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    customer: { findFirst: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { GET, PUT, DELETE } from "./route";

const user = { id: "user-1", name: "Demo", email: "demo@example.com" };
const CUSTOMER_ID = "550e8400-e29b-41d4-a716-446655440001";

function params(id = CUSTOMER_ID) {
  return { params: Promise.resolve({ id }) };
}

function jsonRequest(body: unknown, method = "PUT") {
  return new Request(`http://localhost/api/v1/customers/${CUSTOMER_ID}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const ownedCustomer = { id: CUSTOMER_ID, userId: "user-1", name: "Ahmed Khan", _count: { quotes: 0, invoices: 0 } };
const validBody = { name: "Ahmed Khan Updated" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/customers/:id", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET(new Request("http://localhost"), params());
    expect(response.status).toBe(401);
  });

  it("returns 404 (not 403) when the customer isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), params());

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("CUSTOMER_NOT_FOUND");
    const call = vi.mocked(prisma.customer.findFirst).mock.calls[0][0];
    expect(call?.where).toMatchObject({ id: CUSTOMER_ID, userId: "user-1" });
  });

  it("rejects a request for another user's customer id even when authenticated as someone else", async () => {
    const otherUser = { id: "user-2", name: "Other", email: "other@example.com" };
    vi.mocked(getCurrentUser).mockResolvedValue(otherUser);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), params(CUSTOMER_ID));

    expect(response.status).toBe(404);
    const call = vi.mocked(prisma.customer.findFirst).mock.calls[0][0];
    expect(call?.where).toMatchObject({ userId: "user-2" });
  });

  it("returns the customer when owned", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue(ownedCustomer as never);

    const response = await GET(new Request("http://localhost"), params());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(CUSTOMER_ID);
  });
});

describe("PUT /api/v1/customers/:id", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await PUT(jsonRequest(validBody), params());
    expect(response.status).toBe(401);
  });

  it("rejects an invalid body", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    const response = await PUT(jsonRequest({ name: "" }), params());
    expect(response.status).toBe(400);
  });

  it("returns 404 when the customer isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue(null);

    const response = await PUT(jsonRequest(validBody), params());
    expect(response.status).toBe(404);
  });

  it("updates the customer when owned", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue(ownedCustomer as never);
    vi.mocked(prisma.customer.update).mockResolvedValue({ ...ownedCustomer, ...validBody } as never);

    const response = await PUT(jsonRequest(validBody), params());

    expect(response.status).toBe(200);
    expect(prisma.customer.update).toHaveBeenCalledWith({
      where: { id: CUSTOMER_ID },
      data: expect.objectContaining({ name: "Ahmed Khan Updated" }),
    });
  });
});

describe("DELETE /api/v1/customers/:id", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());
    expect(response.status).toBe(401);
  });

  it("returns 404 when the customer isn't owned by the user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue(null);

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());
    expect(response.status).toBe(404);
  });

  it("returns 409 CUSTOMER_HAS_DOCUMENTS when the customer has quotes or invoices", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue({
      ...ownedCustomer,
      _count: { quotes: 1, invoices: 0 },
    } as never);

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("CUSTOMER_HAS_DOCUMENTS");
  });

  it("deletes a customer with no documents", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user);
    vi.mocked(prisma.customer.findFirst).mockResolvedValue(ownedCustomer as never);
    vi.mocked(prisma.customer.delete).mockResolvedValue(ownedCustomer as never);

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), params());

    expect(response.status).toBe(200);
    expect(prisma.customer.delete).toHaveBeenCalledWith({ where: { id: CUSTOMER_ID } });
  });
});

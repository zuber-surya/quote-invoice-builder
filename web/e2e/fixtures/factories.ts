import { randomUUID } from "node:crypto";
import { PrismaClient, type QuoteStatus, type InvoiceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

// Testing & QA Spec section 8-9 — fixture/factory functions for E2E setup, backed by
// the test database (never dev/production — .env.test.example, docker-compose.yml's
// postgres-test service). Isolation strategy: every factory generates unique data
// (randomUUID-suffixed email/name), and cleanupTestUser() cascades-deletes a user's
// entire fixture tree in one call (every child table has onDelete: Cascade back to
// User in schema.prisma) — no shared/global state between tests.
export const prisma = new PrismaClient();

const PLAIN_TEST_PASSWORD = "e2e-test-password-1";

export async function createTestUser(overrides?: { name?: string; email?: string; password?: string }) {
  const password = overrides?.password ?? PLAIN_TEST_PASSWORD;
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: overrides?.name ?? "E2E Test User",
      email: overrides?.email ?? `e2e-${randomUUID()}@example.com`,
      passwordHash,
    },
  });

  return { ...user, password };
}

export async function createTestBusinessProfile(
  userId: string,
  overrides?: Partial<{ businessName: string; currency: string }>
) {
  return prisma.businessProfile.create({
    data: {
      userId,
      businessName: overrides?.businessName ?? "E2E Test Business",
      currency: overrides?.currency ?? "INR",
    },
  });
}

export async function createTestCustomer(userId: string, overrides?: Partial<{ name: string; email: string }>) {
  return prisma.customer.create({
    data: {
      userId,
      name: overrides?.name ?? `E2E Customer ${randomUUID().slice(0, 8)}`,
      email: overrides?.email ?? null,
    },
  });
}

export async function createTestProduct(
  userId: string,
  overrides?: Partial<{ name: string; unit: string; price: string; taxRate: string }>
) {
  return prisma.product.create({
    data: {
      userId,
      name: overrides?.name ?? `E2E Product ${randomUUID().slice(0, 8)}`,
      unit: overrides?.unit ?? "Unit",
      price: overrides?.price ?? "1000.00",
      taxRate: overrides?.taxRate ?? "0.00",
    },
  });
}

// Direct-insert quote/invoice helpers — for scenarios that need an existing document
// as a starting point (e.g. recording a payment) without re-driving the creation UI in
// every spec. The creation flow itself is exercised by the primary E2E flow test.
export async function createTestQuote(
  userId: string,
  customerId: string,
  overrides?: Partial<{ quoteNumber: string; status: QuoteStatus; totalAmount: string }>
) {
  return prisma.quote.create({
    data: {
      userId,
      customerId,
      quoteNumber: overrides?.quoteNumber ?? `E2E-Q-${randomUUID().slice(0, 8)}`,
      quoteDate: new Date(),
      status: overrides?.status ?? "DRAFT",
      subtotal: overrides?.totalAmount ?? "1000.00",
      totalAmount: overrides?.totalAmount ?? "1000.00",
    },
  });
}

export async function createTestInvoice(
  userId: string,
  customerId: string,
  overrides?: Partial<{ invoiceNumber: string; status: InvoiceStatus; totalAmount: string; paidAmount: string }>
) {
  return prisma.invoice.create({
    data: {
      userId,
      customerId,
      invoiceNumber: overrides?.invoiceNumber ?? `E2E-INV-${randomUUID().slice(0, 8)}`,
      invoiceDate: new Date(),
      status: overrides?.status ?? "UNPAID",
      subtotal: overrides?.totalAmount ?? "1000.00",
      totalAmount: overrides?.totalAmount ?? "1000.00",
      paidAmount: overrides?.paidAmount ?? "0.00",
    },
  });
}

// There is no separate Payment model (V1 simplification — payment fields live on
// Invoice, see docs/Database Design Document.md); this sets them directly for fast
// test setup. The actual payment-recording *flow* is exercised through the UI in the
// payment E2E specs, not through this helper.
export async function createTestPayment(invoiceId: string, amount: string, totalAmount: string) {
  const paid = Number(amount) >= Number(totalAmount);
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: amount,
      status: paid ? "PAID" : "PARTIALLY_PAID",
      paidDate: paid ? new Date() : null,
    },
  });
}

export async function cleanupTestUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } }).catch(() => {
    // Already deleted or never committed (e.g. a failed setup) — nothing to clean up.
  });
}

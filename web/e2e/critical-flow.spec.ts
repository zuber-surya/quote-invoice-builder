import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { prisma, cleanupTestUser } from "./fixtures/factories";

// Testing & QA Spec section 61 (E2E Web Test — Primary Flow) / section 97 (Final MVP
// Test Flow): "if this workflow works reliably, the core MVP is in good shape."
// Register -> Business Profile -> Dashboard -> Customer -> Product -> Quote ->
// Generate -> Accept -> Convert to Invoice -> Partial Payment -> Full Payment -> Paid.
test.describe.configure({ mode: "serial" });

const email = `e2e-critical-${randomUUID()}@example.com`;
const password = "e2e-test-password-1";
let userId: string;

test.afterAll(async () => {
  if (userId) await cleanupTestUser(userId);
  await prisma.$disconnect();
});

test("Register -> Quote -> Accept -> Convert to Invoice -> Paid", async ({ page }) => {
  // Register
  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Critical Flow User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  // PRD core flow: Register -> Business Profile Setup
  await expect(page).toHaveURL(/\/business-profile/);
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  userId = user.id;

  await page.getByLabel("Business Name *").fill("E2E Critical Flow Business");
  await page.getByRole("button", { name: "Save & Continue" }).click();

  // Dashboard
  await expect(page).toHaveURL(/\/dashboard/);

  // Create Customer
  await page.goto("/customers/new");
  await page.getByLabel("Customer Name *").fill("E2E Critical Flow Customer");
  await page.getByRole("button", { name: "Create Customer" }).click();
  await expect(page.getByRole("heading", { name: "E2E Critical Flow Customer" })).toBeVisible();

  // Create Product
  await page.goto("/products/new");
  await page.getByLabel("Product / Service Name *").fill("E2E Consulting");
  await page.getByLabel("Unit *").fill("Hour");
  await page.getByLabel("Price *").fill("10000");
  await page.getByLabel("Tax %").fill("18");
  await page.getByRole("button", { name: "Create Product" }).click();
  await expect(page.getByRole("heading", { name: "E2E Consulting" })).toBeVisible();

  // Create Quote — custom item (not selecting the product from the dropdown, to keep
  // the Select interaction out of this already-long flow; item creation itself is
  // covered directly by lib/document-calculation.test.ts and the quote route tests).
  await page.goto("/quotes/new");
  await page.getByLabel("Customer *").click();
  await page.getByRole("option", { name: "E2E Critical Flow Customer" }).click();
  await page.getByLabel("Name *").fill("E2E Consulting");
  await page.getByLabel("Unit *").fill("Hour");
  await page.getByLabel("Qty *").fill("2");
  await page.getByLabel("Unit Price *").fill("10000.00");
  await page.getByLabel("Tax %").fill("18");

  // Preview total per API Spec section 76 Test 2 shape: qty 2 x 10000 = 20000,
  // 18% tax = 3600, total 23600 (no discount here).
  await expect(page.getByText("23600.00")).toBeVisible();

  await page.getByRole("button", { name: "Save Draft" }).click();
  await expect(page).toHaveURL(/\/quotes\/[0-9a-f-]+$/);
  await expect(page.getByText("Draft")).toBeVisible();

  // Generate (send) -> Accept
  await page.getByRole("button", { name: "Send / Mark as Sent" }).click();
  await expect(page.getByText("Sent", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Mark Accepted" }).click();
  await expect(page.getByText("Accepted", { exact: true })).toBeVisible();

  // Convert to Invoice
  await page.getByRole("button", { name: "Convert to Invoice" }).click();
  await expect(page).toHaveURL(/\/invoices\/[0-9a-f-]+$/);
  await expect(page.getByText("Unpaid")).toBeVisible();
  await expect(page.getByText("23600.00").first()).toBeVisible();

  // Partial payment
  await page.getByRole("button", { name: "Record Payment" }).click();
  await page.getByLabel("Amount *").fill("10000.00");
  await page.getByRole("button", { name: "Record Payment" }).click();
  await expect(page.getByText("Partially Paid")).toBeVisible();
  await expect(page.getByText("13600.00").first()).toBeVisible(); // remaining

  // Final payment
  await page.getByRole("button", { name: "Record Payment" }).click();
  await page.getByLabel("Amount *").fill("13600.00");
  await page.getByRole("button", { name: "Record Payment" }).click();
  await expect(page.getByText("Paid", { exact: true })).toBeVisible();
  await expect(page.getByText("0.00").first()).toBeVisible(); // remaining
});

import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import {
  prisma,
  cleanupTestUser,
  createTestCustomer,
  createTestProduct,
  createTestQuote,
  createTestInvoice,
} from "./fixtures/factories";

// One-off visual tour spec — walks every redesigned page and captures a screenshot
// (plus a full video of the run) so the warm-professional redesign can be reviewed
// without spinning up the app by hand. Not part of the regular CI suite's coverage
// goals — it asserts just enough to fail loudly if a page breaks, not full behavior.
test.describe.configure({ mode: "serial" });
test.use({ video: "on" });

const SHOT_DIR = process.env.E2E_TOUR_SHOT_DIR ?? "e2e-tour-screenshots";

const email = `e2e-tour-${randomUUID()}@example.com`;
const password = "e2e-test-password-1";
let userId: string;

test.afterAll(async () => {
  if (userId) await cleanupTestUser(userId);
  await prisma.$disconnect();
});

async function shot(page: import("@playwright/test").Page, name: string) {
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, fullPage: true });
}

test("redesign tour — every page, logged-out through populated", async ({ page }) => {
  // Logged-out pages
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  await shot(page, "01-login");

  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await shot(page, "02-register");

  // Register -> Business Profile (first-time setup)
  await page.getByLabel("Name").fill("E2E Tour User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/business-profile/);
  await shot(page, "03-business-profile-first-setup");

  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  userId = user.id;

  await page.getByLabel("Business Name *").fill("E2E Tour Business");
  await page.getByRole("button", { name: "Save & Continue" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await shot(page, "04-dashboard-empty");

  // Seed one of everything so list/detail pages show real content, not empty states.
  const customer = await createTestCustomer(userId, { name: "E2E Tour Customer" });
  const product = await createTestProduct(userId, { name: "E2E Tour Product" });
  const draftQuote = await createTestQuote(userId, customer.id, { status: "DRAFT" });
  const draftInvoice = await createTestInvoice(userId, customer.id, { status: "DRAFT" });
  const unpaidInvoice = await createTestInvoice(userId, customer.id, { status: "UNPAID" });

  await page.goto("/dashboard");
  await shot(page, "05-dashboard-populated");

  // Customers
  await page.goto("/customers");
  await expect(page.getByText("E2E Tour Customer").first()).toBeVisible();
  await shot(page, "06-customers-list");

  await page.goto("/customers/new");
  await shot(page, "07-customers-new");

  await page.goto(`/customers/${customer.id}`);
  await shot(page, "08-customers-detail");

  await page.goto(`/customers/${customer.id}/edit`);
  await shot(page, "09-customers-edit");

  // Products
  await page.goto("/products");
  await expect(page.getByText("E2E Tour Product").first()).toBeVisible();
  await shot(page, "10-products-list");

  await page.goto("/products/new");
  await shot(page, "11-products-new");

  await page.goto(`/products/${product.id}`);
  await shot(page, "12-products-detail");

  await page.goto(`/products/${product.id}/edit`);
  await shot(page, "13-products-edit");

  // Quotes
  await page.goto("/quotes");
  await expect(page.getByText(draftQuote.quoteNumber).first()).toBeVisible();
  await shot(page, "14-quotes-list");

  await page.goto("/quotes/new");
  await shot(page, "15-quotes-new");

  await page.goto(`/quotes/${draftQuote.id}`);
  await shot(page, "16-quotes-detail-draft");

  await page.goto(`/quotes/${draftQuote.id}/edit`);
  await shot(page, "17-quotes-edit");

  // Invoices
  await page.goto("/invoices");
  await expect(page.getByText(draftInvoice.invoiceNumber).first()).toBeVisible();
  await shot(page, "18-invoices-list");

  await page.goto("/invoices/new");
  await shot(page, "19-invoices-new");

  await page.goto(`/invoices/${draftInvoice.id}`);
  await shot(page, "20-invoices-detail-draft");

  await page.goto(`/invoices/${draftInvoice.id}/edit`);
  await shot(page, "21-invoices-edit");

  await page.goto(`/invoices/${unpaidInvoice.id}`);
  await shot(page, "22-invoices-detail-unpaid");

  await page.getByRole("button", { name: "Record Payment" }).click();
  await expect(page.getByLabel("Amount *")).toBeVisible();
  await shot(page, "23-invoices-record-payment-form");

  // Business Profile, now in "already set up" (edit) mode
  await page.goto("/business-profile");
  await expect(page.getByRole("heading", { name: "Business Profile" })).toBeVisible();
  await shot(page, "24-business-profile-edit-mode");
});

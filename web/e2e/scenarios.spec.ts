import { test, expect } from "@playwright/test";
import {
  createTestUser,
  createTestBusinessProfile,
  createTestCustomer,
  createTestQuote,
  cleanupTestUser,
} from "./fixtures/factories";

// Testing & QA Spec sections 62 and 65. Sections 63-64 (partial/full payment) are
// already exercised end-to-end by critical-flow.spec.ts's primary flow — duplicating
// near-identical payment assertions here would just be redundant coverage.
//
// These use the factories to seed state directly (skip re-driving registration,
// already covered by critical-flow.spec.ts) and log in via the real UI, then exercise
// only the behavior under test through the UI.
test.describe.configure({ mode: "serial" });

async function loginViaUi(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("Draft quote", () => {
  let userId: string;

  test.afterAll(async () => {
    if (userId) await cleanupTestUser(userId);
  });

  test("persists as Draft after save and reload — section 62", async ({ page }) => {
    const user = await createTestUser();
    userId = user.id;
    await createTestBusinessProfile(user.id);
    await createTestCustomer(user.id, { name: "Persistence Scenario Customer" });

    await loginViaUi(page, user.email, user.password);

    await page.goto("/quotes/new");
    await page.getByLabel("Customer *").click();
    await page.getByRole("option", { name: "Persistence Scenario Customer" }).click();
    await page.getByLabel("Name *").fill("Persistence Item");
    await page.getByLabel("Unit *").fill("Unit");
    await page.getByLabel("Qty *").fill("1");
    await page.getByLabel("Unit Price *").fill("500.00");
    await page.getByRole("button", { name: "Save Draft" }).click();

    await expect(page).toHaveURL(/\/quotes\/[0-9a-f-]+$/);
    await expect(page.getByText("Draft", { exact: true })).toBeVisible();
    const quoteUrl = page.url();

    // Close and reopen — navigate away, then back to the same quote by URL.
    await page.goto("/quotes");
    await page.goto(quoteUrl);

    await expect(page.getByText("Draft", { exact: true })).toBeVisible();
    await expect(page.getByText("Persistence Item")).toBeVisible();
    await expect(page.getByText("500.00").first()).toBeVisible();
  });
});

test.describe("Cross-user authorization", () => {
  let userAId: string;
  let userBId: string;

  test.afterAll(async () => {
    if (userAId) await cleanupTestUser(userAId);
    if (userBId) await cleanupTestUser(userBId);
  });

  test("User B cannot open User A's quote by direct URL — section 65", async ({ page }) => {
    const userA = await createTestUser({ name: "User A" });
    userAId = userA.id;
    const customerA = await createTestCustomer(userA.id);
    const quoteA = await createTestQuote(userA.id, customerA.id, { quoteNumber: "E2E-AUTH-Q-1" });

    const userB = await createTestUser({ name: "User B" });
    userBId = userB.id;
    await createTestBusinessProfile(userB.id);

    await loginViaUi(page, userB.email, userB.password);

    const response = await page.goto(`/quotes/${quoteA.id}`);
    expect(response?.status()).toBe(404);
  });
});

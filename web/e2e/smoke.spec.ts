import { test, expect } from "@playwright/test";

// Proves the Playwright harness itself works (server boots against the test DB,
// browser launches, page renders) before any real flow is built on top of it.
test("login page loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});

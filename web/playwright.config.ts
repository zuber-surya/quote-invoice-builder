import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// Next.js auto-loads .env for its own dev/build process, but this config and the
// fixtures/factories.ts Prisma client run as plain Node under the Playwright test
// runner, which doesn't get that for free. dotenv here never overrides an already-set
// process.env var (its default), so CI's explicit `env:` block in ci.yml still wins.
loadEnv({ path: ".env.test" });

// Testing & QA Spec section 5, 61 — Playwright covers the critical user workflows.
// Runs against a dev server pointed at the test database (never dev/production —
// section 7); see .env.test.example and docker-compose.yml's postgres-test service.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // shares one Postgres test DB — avoid cross-test interference
  // The primary critical-flow spec is a legitimately long multi-page workflow
  // (register through payment) — the 30s default is too short for that, not a sign
  // of anything broken.
  timeout: 90_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "html",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3100",
    trace: "on-first-retry",
  },
  // `next dev` compiles each route on first visit, which is slow enough to make a
  // multi-page flow spec flaky against default timeouts — that's dev-mode JIT lag,
  // not a real bug (confirmed while building the primary flow spec: identical steps
  // pass reliably against a production build). Playwright's own guidance is to test
  // against a production build for this reason.
  expect: { timeout: 10_000 },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    // A cold build+start (lint + typecheck + page-data collection, then server boot)
    // measured 250s+ end to end in this environment — generous margin here avoids a
    // spurious webServer timeout that has nothing to do with the app itself.
    timeout: 480_000,
  },
});

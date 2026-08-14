import { configDefaults, defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    // e2e/ holds Playwright specs (test:e2e script) — they use @playwright/test's
    // test()/expect(), not vitest's, and must never be picked up here.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});

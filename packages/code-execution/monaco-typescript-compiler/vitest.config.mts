import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 20_000,
    browser: {
      provider: "playwright",
      enabled: true,
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: "chromium" }],
    },
  },
});

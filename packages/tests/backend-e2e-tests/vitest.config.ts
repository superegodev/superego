import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "nodejs",
          include: ["src/index.nodejs.test.ts"],
        },
      },
      {
        test: {
          name: "browser",
          include: ["src/index.browser.test.ts"],
          browser: {
            provider: "playwright",
            enabled: true,
            headless: true,
            screenshotFailures: false,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});

import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "nodejs",
          include: ["src/requirement-implementations/nodejs/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "browser",
          include: ["src/requirement-implementations/browser/**/*.test.ts"],
          browser: {
            provider: playwright(),
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

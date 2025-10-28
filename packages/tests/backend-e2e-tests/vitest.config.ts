import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "nodejs",
          setupFiles: ["src/vitest-setup.ts"],
          include: ["src/index.nodejs.test.ts"],
        },
      },
      {
        test: {
          name: "browser",
          setupFiles: ["src/vitest-setup.ts"],
          include: ["src/index.browser.test.ts"],
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

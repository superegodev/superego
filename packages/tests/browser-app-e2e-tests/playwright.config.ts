import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }]],
  // Cold page loads take 10–15 seconds on CI, and scenarios navigate repeatedly.
  timeout: process.env.CI ? 120_000 : 30_000,
  use: {
    baseURL: "http://localhost:5173",
    trace: process.env.CI ? "on-first-retry" : "retain-on-first-failure",
    contextOptions: {
      reducedMotion: "reduce",
    },
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0,
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: {
          width: 1600,
          height: 1600,
        },
      },
    },
  ],
  webServer: {
    command: "yarn workspace @superego/browser-app dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});

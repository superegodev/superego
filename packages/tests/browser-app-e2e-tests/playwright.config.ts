import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["@midscene/web/playwright-reporter", { type: "merged" }],
  ],
  timeout: 90_000,
  use: {
    baseURL: "http://localhost:5173",
    trace: process.env.CI ? "on-first-retry" : "retain-on-first-failure",
    contextOptions: {
      reducedMotion: "reduce",
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

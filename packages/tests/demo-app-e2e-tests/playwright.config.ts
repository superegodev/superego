import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:5173",
    trace: process.env.CI ? "on-first-retry" : "retain-on-first-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Disabled as it misbehaves when loading data (too slow it seems).
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 15"] },
    },
  ],
  webServer: {
    command: "yarn workspace @superego/demo-app dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});

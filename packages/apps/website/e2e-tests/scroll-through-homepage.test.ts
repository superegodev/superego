import { expect, test } from "@playwright/test";

test("Scroll through homepage", async ({ page }) => {
  await page.goto("/");

  const stepsCount = await page.locator(".step").count();

  for (let i = 0; i < stepsCount - 1; i++) {
    await page.click("#scroll-down-button");
    await expect(page).toHaveScreenshot();
  }
});

import { expect, test } from "@playwright/test";

test("Scroll through homepage", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot();

  await page.click("#scroll-down-button");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot();

  await page.click("#scroll-down-button");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot();

  await page.click("#scroll-down-button");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot();
});

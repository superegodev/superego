import { expect, test } from "@playwright/test";

test("Homepage above-fold appearance", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot();
});

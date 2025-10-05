import { expect, test } from "@playwright/test";
import ensureSidebarVisible from "../utils/ensureSidebarVisible.js";

test("Load demo data", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);

  await ensureSidebarVisible(page);

  await page.getByRole("button", { name: /Load demo data/i }).click();
  await page.getByRole("button", { name: /Yes, load/i }).click();

  await expect(page.getByRole("gridcell", { name: /Contacts/i })).toBeVisible();
});

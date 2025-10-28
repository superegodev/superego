import { expect, test } from "@playwright/test";

test("Scroll through homepage", async ({ page }) => {
  await page.goto("/");

  const stepsCount = await page.locator(".step").count();

  for (let i = 0; i < stepsCount; i++) {
    const nextStep = page.locator(".step").nth(i);
    await nextStep.evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "auto" }),
    );
    await expect(page).toHaveScreenshot();
  }
});

import test from "@playwright/test";
import mainPanel from "../locators/mainPanel.js";
import installProductivityPack from "../routines/installProductivityPack.js";
import VisualEvaluator from "../VisualEvaluator.js";

test("001. Create Contact", async ({ page }) => {
  await test.step("00. Install Productivity pack", async () => {
    // Exercise
    await installProductivityPack(page);

    // Verify
    await VisualEvaluator.expectToSee(
      "00.png",
      mainPanel(page),
      "empty Contacts collection page, create document icon button (top right)",
    );
  });

  await test.step("01. Navigate to create Contact page", async () => {
    // Exercise
    await page.getByRole("link", { name: /Create document/i }).click();
    await page.getByRole("button", { name: /^Create$/i }).waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "01.png",
      mainPanel(page),
      "create Contact form, disabled Create button",
    );
  });

  await test.step("02. Fill Contact details", async () => {
    // Exercise
    await page.getByLabel(/^Type/i).click();
    await page.getByRole("option", { name: /Person/i }).click();
    await page.getByRole("textbox", { name: /^Name/i }).fill("Carl Jung");
    await page.getByRole("textbox", { name: /^Relation/i }).fill("Protégé");
    await page
      .getByRole("textbox", { name: /^Number/i })
      .fill("+41 44 123 45 67");
    await page.getByRole("textbox", { name: /^Address/i }).fill("carl@jung.ch");
    await page
      .locator(".ProseMirror")
      .first()
      .fill("Ambitious. Watch his drift toward mysticism.");
    // Wait for the debounce on the TipTap input.
    await page.waitForTimeout(500);

    // Verify
    await VisualEvaluator.expectToSee(
      "02.png",
      mainPanel(page),
      "contact form filled with made-up Carl Jung details",
    );
  });

  await test.step("03. Create contact", async () => {
    // Exercise
    await page.getByRole("button", { name: /^Create$/i }).click();
    await page.getByRole("button", { name: /^Save$/i }).waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "03.png",
      mainPanel(page),
      "contact detail page for Carl Jung, disabled save icon button (top right)",
    );
  });
});

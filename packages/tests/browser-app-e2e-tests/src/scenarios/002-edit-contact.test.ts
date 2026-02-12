import test from "@playwright/test";
import mainPanel from "../locators/mainPanel.js";
import tiptapInput from "../locators/tiptapInput.js";
import createContact from "../routines/createContact.js";
import installProductivityPack from "../routines/installProductivityPack.js";
import VisualEvaluator from "../VisualEvaluator.js";

test("002. Edit Contact", async ({ page }) => {
  await test.step("00. Install Productivity pack and create Contact", async () => {
    // Exercise
    await installProductivityPack(page);
    await createContact(page, {
      name: "Carl Jung",
      relation: "Protégé",
      number: "+41 44 123 45 67",
      address: "carl@jung.ch",
      notes: "Ambitious. Watch his drift toward mysticism.",
    });

    // Verify
    await VisualEvaluator.expectToSee(
      "00.png",
      mainPanel(page),
      "page with form to edit Contact document Carl Jung",
    );
  });

  await test.step("01. Edit relation field", async () => {
    // Exercise
    await page.getByRole("textbox", { name: /^Relation/i }).fill("Colleague");

    // Verify
    await VisualEvaluator.expectToSee(
      "01.png",
      mainPanel(page),
      "contact detail page, Relation set to Colleague, enabled save icon button (top right)",
    );
  });

  await test.step("02. Save updated contact", async () => {
    // Exercise
    await page.getByRole("button", { name: /^Save$/i }).click();
    await page.waitForTimeout(500);

    // Verify
    await VisualEvaluator.expectToSee(
      "02.png",
      mainPanel(page),
      "contact detail page, Relation set to Colleague, disabled save icon button (top right)",
    );
  });

  await test.step("03. Reload page and verify same state", async () => {
    // Exercise
    await page.reload();
    await tiptapInput(page).waitFor();
    await page.getByRole("textbox", { name: /^Relation/i }).waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "03.png",
      mainPanel(page),
      "contact detail page, Relation set to Colleague, disabled save icon button (top right)",
    );
  });
});

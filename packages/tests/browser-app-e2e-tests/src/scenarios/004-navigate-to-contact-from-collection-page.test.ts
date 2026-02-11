import test from "@playwright/test";
import openSidebar from "../actions/openSidebar.js";
import waitForTiptapInput from "../actions/waitForTiptapInput.js";
import mainPanel from "../locators/mainPanel.js";
import createContact from "../routines/createContact.js";
import installProductivityPack from "../routines/installProductivityPack.js";
import VisualEvaluator from "../VisualEvaluator.js";

test("004. Navigate to Contact from collection page", async ({ page }) => {
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
      "contact detail page for Carl Jung, disabled save icon button (top right)",
    );
  });

  await test.step("01. Navigate to Contacts collection page", async () => {
    // Exercise
    await openSidebar(page);
    const expandProductivityButton = page.getByRole("button", {
      name: /Expand Productivity/i,
    });
    if (await expandProductivityButton.isVisible()) {
      await expandProductivityButton.click();
    }
    await page.getByRole("row", { name: /Contacts/i }).click();
    await mainPanel(page)
      .getByRole("rowheader", { name: /Carl Jung/i })
      .waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "01.png",
      mainPanel(page),
      "Contacts collection table with a row for Carl Jung",
    );
  });

  await test.step("02. Click on Contact table row", async () => {
    // Exercise
    await mainPanel(page)
      .getByRole("rowheader", { name: /Carl Jung/i })
      .click();
    await page.getByRole("textbox", { name: /^Name/i }).waitFor();
    await waitForTiptapInput(page);

    // Verify
    await VisualEvaluator.expectToSee(
      "02.png",
      mainPanel(page),
      "contact detail page for Carl Jung",
    );
  });
});

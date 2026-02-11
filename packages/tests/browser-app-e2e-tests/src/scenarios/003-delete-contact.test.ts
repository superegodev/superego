import test from "@playwright/test";
import mainPanel from "../locators/mainPanel.js";
import createContact from "../routines/createContact.js";
import installProductivityPack from "../routines/installProductivityPack.js";
import VisualEvaluator from "../VisualEvaluator.js";

test("003. Delete Contact", async ({ page }) => {
  await test.step("00. Install Productivity pack and create contact", async () => {
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

  await test.step("01. Open delete document modal", async () => {
    // Exercise
    await page.getByRole("button", { name: /Delete document/i }).click();
    await page.getByRole("dialog").waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "01.png",
      page.getByRole("dialog"),
      "delete document confirmation modal with command confirmation input and Delete button",
    );
  });

  await test.step("02. Type wrong confirmation text", async () => {
    // Exercise
    await page
      .getByRole("textbox", { name: /Command confirmation/i })
      .fill("delet");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /^Delete$/i })
      .click();
    await page.getByRole("dialog").waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "02.png",
      page.getByRole("dialog"),
      'delete document modal with command confirmation value "delet" and a validation error',
    );
  });

  await test.step("03. Type exact confirmation text", async () => {
    // Exercise
    await page
      .getByRole("textbox", { name: /Command confirmation/i })
      .fill("delete");

    // Verify
    await VisualEvaluator.expectToSee(
      "03.png",
      page.getByRole("dialog"),
      'delete document modal with command confirmation value "delete" no validation errors',
    );
  });

  await test.step("04. Confirm deletion and return to empty collection", async () => {
    // Exercise
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /^Delete$/i })
      .click();
    await page
      .getByText("This collection doesn't have any documents yet.")
      .waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "04.png",
      mainPanel(page),
      "empty Contacts collection table with no documents",
    );
  });

  await test.step("05. Reload and verify same state", async () => {
    // Exercise
    await page.reload();
    await page
      .getByText("This collection doesn't have any documents yet.")
      .waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "05.png",
      mainPanel(page),
      "empty Contacts collection table with no documents",
    );
  });
});

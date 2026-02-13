import test from "@playwright/test";
import openSidebar from "../actions/openSidebar.js";
import VisualEvaluator from "../VisualEvaluator.js";

test("000. Install Productivity pack", async ({ page }) => {
  await test.step("00. Go to homepage", async () => {
    // Exercise
    await page.goto("/");
    await page.getByText("Your Digital Freedom").waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "00.png",
      page,
      "logo + name + motto, chat message input, empty sidebar",
    );
  });

  await test.step("01. Click on Bazaar sidebar link", async () => {
    // Exercise
    await openSidebar(page);
    await page.getByRole("link", { name: /^Bazaar$/i }).click();
    await page.getByRole("link", { name: /Productivity/i }).waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "01.png",
      page,
      'Bazaar page with a list of "packs" as cards, Productivity pack card',
    );
  });

  await test.step("02. Click on Productivity pack", async () => {
    // Exercise
    await page.getByRole("link", { name: /Productivity/i }).click();
    await page.getByRole("button", { name: /^Install$/i }).waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "02.png",
      page,
      "Productivity pack detail page, Install button",
    );
  });

  await test.step("03. Open install modal", async () => {
    // Exercise
    await page.getByRole("button", { name: /^Install$/i }).click();
    await page.getByRole("dialog").waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "03.png",
      page,
      "install confirmation modal",
    );
  });

  await test.step("04. Install pack", async () => {
    // Exercise
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /^Install$/i })
      .click();
    await page.getByRole("link", { name: /Create document/i }).waitFor();

    // Verify
    await VisualEvaluator.expectToSee(
      "04.png",
      page,
      "empty Contacts collection page, create document icon button (top right)",
    );
  });
});

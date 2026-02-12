import type { Page } from "@playwright/test";

/**
 * Creates the productivity pack.
 *
 * Starts: anywhere.
 * Ends: newly-created Contacts collection page.
 */
export default async function installProductivityPack(page: Page) {
  // Navigate to the Bazaar page.
  await page.goto("/bazaar");

  // Navigate to the Productivity pack detail page.
  await page
    .getByRole("link", { name: /Productivity/i })
    .first()
    .click();

  // Open the install modal.
  await page
    .getByRole("button", { name: /^Install$/i })
    .first()
    .click();

  // Confirm install.
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Install$/i })
    .click();

  // Wait for installation to finish and to be on the Contacts collection page.
  await page.getByRole("link", { name: /Create document/i }).waitFor();
}

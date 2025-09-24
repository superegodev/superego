import { expect, type Page } from "@playwright/test";
import type CollectionDefinition from "./CollectionDefinition.js";
import writeOnCodeInput from "./writeOnCodeInput.js";

export default async function createCollection(
  page: Page,
  collectionDefinition: CollectionDefinition,
) {
  const { name, schema, contentSummaryGetter } = collectionDefinition;

  // Go to collection creation manual mode.
  await page.getByRole("link", { name: "Create collection" }).click();
  await page.getByRole("link", { name: "Go to manual mode" }).click();

  // 1. General settings
  await page.locator("#name").fill(name);

  // 2. Schema
  await page.getByRole("tab", { name: /schema/i }).click();
  await writeOnCodeInput(page, JSON.stringify(schema));

  // 3. Content summary
  await page.getByRole("tab", { name: /summary/i }).click();
  await writeOnCodeInput(page, contentSummaryGetter);

  // Create.
  await page.getByRole("button", { name: "Create", exact: true }).click();

  // Test created collection.
  await expect(page.getByRole("banner")).toContainText(name);
}

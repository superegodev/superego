import fs from "node:fs";
import { expect, type Page } from "@playwright/test";

export type CollectionOptions = {
  name: string;
  schema: object;
  valueGetter: string;
};

export async function createCollection(
  page: Page,
  collectionOptions: CollectionOptions,
) {
  const { name, schema, valueGetter } = collectionOptions;

  await page.getByRole("link", { name: "Create collection" }).click();
  await page.locator("#name").fill(name);
  await page.getByRole("textbox", { name: "Schema" }).click();
  await page.getByRole("textbox", { name: "Schema" }).press("ControlOrMeta+a");
  await page
    .getByRole("textbox", { name: "Schema" })
    .fill(JSON.stringify(schema, null, 2));
  // Set value getter
  await writeOnTsEditor(page, valueGetter);
  await page.getByRole("button", { name: "Create", exact: true }).click();

  // Test collection created
  await expect(page.getByRole("banner")).toContainText(name);
}

async function writeOnTsEditor(page: Page, content: string) {
  const typescriptContainer = page.getByTestId("typescript-module-input");
  await typescriptContainer.click();

  // Wait for the Monaco editor to become active (ReadWrite mode)
  await page.waitForSelector(".monaco-editor", { state: "visible" });

  // Click on the Monaco editor's text area to ensure it's focused
  await page.locator(".monaco-editor .view-lines").click();

  await page.waitForTimeout(200);
  // Select all content and delete it
  await page.keyboard.press("ControlOrMeta+a");
  await page.waitForTimeout(200);
  await page.keyboard.press("ControlOrMeta+x");
  await page.waitForTimeout(200);

  // Type the new content with a small delay to help Monaco detect changes
  await page.keyboard.insertText(content);
  await page.keyboard.type("");

  // Wait for Monaco to process the changes and compilation
  await page.waitForTimeout(3000);
}

export function getValueGetterContent(valueGetterPath: string): string {
  return fs.readFileSync(new URL(valueGetterPath, import.meta.url), "utf-8");
}

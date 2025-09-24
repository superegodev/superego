import type { Page } from "@playwright/test";

// TODO: select by label
export default async function writeOnCodeInput(page: Page, content: string) {
  const typescriptContainer = page.getByTestId("code-input");
  await typescriptContainer.click();

  // Wait for the Monaco editor to become active.
  await page.waitForSelector(".monaco-editor", { state: "visible" });

  // Click on the Monaco editor's text area to ensure it's focused.
  await page.locator(".monaco-editor .view-lines").click();

  // Select all content and delete it.
  await page.waitForTimeout(200);
  await page.keyboard.press("ControlOrMeta+a");
  await page.waitForTimeout(200);
  await page.keyboard.press("ControlOrMeta+x");
  await page.waitForTimeout(200);

  // Type the new content with a small delay to help Monaco detect changes.
  await page.keyboard.insertText(content);
  await page.keyboard.type("");

  // Wait for Monaco to process the changes and compilation.
  await page.waitForTimeout(3000);
}

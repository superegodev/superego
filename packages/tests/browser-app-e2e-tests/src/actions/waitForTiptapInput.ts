import type { Page } from "@playwright/test";

export default async function waitForTiptapInput(page: Page) {
  await page.locator(".ProseMirror").first().waitFor();
}

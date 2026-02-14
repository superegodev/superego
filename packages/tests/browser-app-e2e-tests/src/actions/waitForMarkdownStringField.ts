import type { Page } from "@playwright/test";
import markdownStringField from "../locators/markdownStringField.js";

/**
 * Waits for the Markdown field wrapper AND the lazily-loaded overtype input
 * inside it to be visible.
 */
export default async function waitForMarkdownStringField(page: Page) {
  await markdownStringField(page).locator(".overtype-input").waitFor();
}

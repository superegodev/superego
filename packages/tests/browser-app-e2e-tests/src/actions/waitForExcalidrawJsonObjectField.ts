import type { Page } from "@playwright/test";
import excalidrawJsonObjectField from "../locators/excalidrawJsonObjectField.js";

/**
 * Waits for the Excalidraw field wrapper AND the lazily-loaded Excalidraw
 * component inside it to be visible.
 */
export default async function waitForExcalidrawJsonObjectField(page: Page) {
  await excalidrawJsonObjectField(page).locator(".excalidraw").waitFor();
}

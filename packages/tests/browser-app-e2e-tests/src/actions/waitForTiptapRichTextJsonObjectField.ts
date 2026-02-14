import type { Page } from "@playwright/test";
import tiptapRichTextJsonObjectField from "../locators/tiptapRichTextJsonObjectField.js";

/**
 * Waits for the TiptapRichText field wrapper AND the lazily-loaded ProseMirror
 * editor inside it to be visible.
 */
export default async function waitForTiptapRichTextJsonObjectField(page: Page) {
  await tiptapRichTextJsonObjectField(page).locator(".ProseMirror").waitFor();
}

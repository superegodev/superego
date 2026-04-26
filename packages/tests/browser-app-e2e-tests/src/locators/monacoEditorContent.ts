import type { Locator, Page } from "@playwright/test";

export default function monacoEditorContent(page: Page): Locator {
  return page.locator(".view-lines");
}

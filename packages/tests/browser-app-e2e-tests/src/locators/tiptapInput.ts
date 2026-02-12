import type { Page } from "@playwright/test";

export default function tiptapInput(page: Page) {
  return page.locator(".ProseMirror").first();
}

import type { Locator, Page } from "@playwright/test";

export default function markdownInput(page: Page): Locator {
  return page.locator(".overtype-input").first();
}

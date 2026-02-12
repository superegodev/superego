import type { Locator, Page } from "@playwright/test";

export default function excalidrawInput(page: Page): Locator {
  return page.locator(".excalidraw");
}

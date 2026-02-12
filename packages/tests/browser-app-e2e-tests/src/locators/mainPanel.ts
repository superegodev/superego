import type { Page } from "@playwright/test";

export default function mainPanel(page: Page) {
  return page.locator('[data-slot="Main"]');
}

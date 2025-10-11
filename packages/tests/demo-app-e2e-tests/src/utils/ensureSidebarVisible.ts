import type { Page } from "playwright/test";

export default async function ensureSidebarVisible(page: Page) {
  const openSidebarButton = page.getByRole("button", { name: /Open sidebar/i });
  if (await openSidebarButton.isVisible()) {
    await openSidebarButton.click();
  }
}

import type { Page } from "playwright/test";

export default async function openSidebar(page: Page) {
  const openSidebarButton = page.getByRole("button", { name: /Open sidebar/i });
  // Only open the sidebar if it's closed.
  if (await openSidebarButton.isVisible()) {
    await openSidebarButton.click();
  }
}

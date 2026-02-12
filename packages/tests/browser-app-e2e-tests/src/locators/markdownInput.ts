import type { Locator, Page } from "@playwright/test";
import mainPanel from "./mainPanel.js";

export default function markdownInput(page: Page): Locator {
  return mainPanel(page).locator(".overtype-input").first();
}

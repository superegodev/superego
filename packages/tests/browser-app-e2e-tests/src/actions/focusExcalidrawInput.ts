import type { Page } from "@playwright/test";
import excalidrawInput from "../locators/excalidrawInput.js";
import mainPanel from "../locators/mainPanel.js";

export default async function focusExcalidrawInput(page: Page) {
  await excalidrawInput(page).focus();
  await mainPanel(page)
    .getByRole("button", { name: /^Undo$/i })
    .waitFor();
}

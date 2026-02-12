import type { Page } from "@playwright/test";
import excalidrawInput from "../locators/excalidrawInput.js";

export default async function focusExcalidrawInput(page: Page) {
  await excalidrawInput(page).focus();
  await excalidrawInput(page)
    .getByRole("button", { name: /^Undo$/i })
    .waitFor();
}

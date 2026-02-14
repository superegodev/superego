import type { Page } from "@playwright/test";
import excalidrawJsonObjectField from "../locators/excalidrawJsonObjectField.js";

export default async function focusExcalidrawInput(page: Page) {
  await excalidrawJsonObjectField(page).locator(".excalidraw").focus();
  await excalidrawJsonObjectField(page)
    .getByRole("button", { name: /^Undo$/i })
    .waitFor();
}

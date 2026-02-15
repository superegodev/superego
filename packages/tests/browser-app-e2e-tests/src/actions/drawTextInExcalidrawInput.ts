import type { Page } from "@playwright/test";
import excalidrawJsonObjectField from "../locators/excalidrawJsonObjectField.js";

export default async function drawTextInExcalidrawInput(page: Page) {
  await excalidrawJsonObjectField(page).locator(".excalidraw").click();
  await selectTextTool(page);

  const boundingBox = await excalidrawJsonObjectField(page)
    .locator("canvas")
    .last()
    .boundingBox();
  if (!boundingBox) {
    throw new Error("Excalidraw drawing surface not found");
  }

  const centerX = Math.round(boundingBox.x + boundingBox.width * 0.5);
  const centerY = Math.round(boundingBox.y + boundingBox.height * 0.45);

  await page.mouse.click(centerX, centerY);
  await page.keyboard.type("Hello world!");
}

async function selectTextTool(page: Page) {
  await excalidrawJsonObjectField(page)
    .getByRole("radio", { name: /^Text$/i })
    .check({ force: true });
}

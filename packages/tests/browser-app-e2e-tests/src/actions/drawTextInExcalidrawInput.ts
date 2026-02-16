import type { Page } from "@playwright/test";
import excalidrawJsonObjectField from "../locators/excalidrawJsonObjectField.js";

export default async function drawTextInExcalidrawInput(page: Page) {
  const excalidraw = excalidrawJsonObjectField(page).locator(".excalidraw");
  await excalidraw.click();

  // Select the Rectangle tool
  await excalidraw
    .getByRole("radio", { name: /^Rectangle$/i })
    .check({ force: true });

  // Draw a rectangle
  const boundingBox = await excalidrawJsonObjectField(page)
    .locator("canvas")
    .last()
    .boundingBox();
  if (!boundingBox) {
    throw new Error("Excalidraw drawing surface not found");
  }
  const centerX = Math.round(boundingBox.x + boundingBox.width * 0.5);
  const centerY = Math.round(boundingBox.y + boundingBox.height * 0.45);
  const rectWidth = 100;
  const rectHeight = 60;
  await page.mouse.move(centerX - rectWidth / 2, centerY - rectHeight / 2);
  await page.mouse.down();
  await page.mouse.move(centerX + rectWidth / 2, centerY + rectHeight / 2);
  await page.mouse.up();

  // Change stroke style: click Stroke button, then select Architect
  await excalidraw
    .getByRole("button", { name: /^Stroke$/i })
    .last()
    .click();
  await excalidraw
    .getByTitle("Architect")
    .locator("input")
    .check({ force: true });

  // Close the Stroke popup
  await page.keyboard.press("Escape");

  await page.waitForTimeout(500);
}

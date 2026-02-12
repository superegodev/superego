import type { Page } from "@playwright/test";
import excalidrawInput from "../locators/excalidrawInput.js";

export default async function drawCircleInExcalidrawInput(page: Page) {
  await excalidrawInput(page).click();
  await selectEllipseTool(page);
  await selectArchitectSloppiness(page);

  const drawingSurface = excalidrawInput(page).locator("canvas").last();
  const boundingBox = await drawingSurface.boundingBox();
  if (!boundingBox) {
    throw new Error("Excalidraw drawing surface not found");
  }

  const circleDiameter = Math.round(
    Math.min(boundingBox.width, boundingBox.height) * 0.22,
  );
  const centerX = Math.round(boundingBox.x + boundingBox.width * 0.5);
  const centerY = Math.round(boundingBox.y + boundingBox.height * 0.45);
  const startX = centerX - Math.round(circleDiameter / 2);
  const startY = centerY - Math.round(circleDiameter / 2);
  const endX = centerX + Math.round(circleDiameter / 2);
  const endY = centerY + Math.round(circleDiameter / 2);

  await page.keyboard.down("Shift");
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY);
  await page.mouse.up();
  await page.keyboard.up("Shift");

  const deselectX = Math.round(boundingBox.x + boundingBox.width * 0.85);
  const deselectY = Math.round(boundingBox.y + boundingBox.height * 0.85);
  await page.keyboard.press("v");
  await page.mouse.click(deselectX, deselectY);
  await excalidrawInput(page).focus();
  await page.getByRole("button", { name: /^Undo$/i }).waitFor();
}

async function selectEllipseTool(page: Page) {
  await excalidrawInput(page)
    .getByRole("radio", { name: /^Ellipse$/i })
    .check({ force: true });
}

async function selectArchitectSloppiness(page: Page) {
  await excalidrawInput(page)
    .locator('label[title="Architect"] > input[type="radio"]')
    .check({ force: true });
}

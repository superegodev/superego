import type { Locator, Page } from "@playwright/test";

export default function excalidrawJsonObjectField(page: Page): Locator {
  return page.getByTestId(
    "widgets.RHFContentField.JsonObjectField.ExcalidrawDrawing.root",
  );
}

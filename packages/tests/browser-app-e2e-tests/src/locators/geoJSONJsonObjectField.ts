import type { Locator, Page } from "@playwright/test";

export default function geoJSONJsonObjectField(page: Page): Locator {
  return page.getByTestId(
    "widgets.RHFContentField.JsonObjectField.GeoJSON.root",
  );
}

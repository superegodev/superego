import type { Page } from "@playwright/test";
import geoJSONJsonObjectField from "../locators/geoJSONJsonObjectField.js";

/**
 * Waits for the GeoJSON field wrapper AND the lazily-loaded map container
 * inside it to be attached.
 */
export default async function waitForGeoJSONJsonObjectField(page: Page) {
  await geoJSONJsonObjectField(page)
    .locator("[data-loaded]")
    .waitFor({ state: "attached" });
  await page.waitForTimeout(1_000);
}

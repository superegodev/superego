import type { Page } from "@playwright/test";
import geoJSONJsonObjectField from "../locators/geoJSONJsonObjectField.js";

export default async function drawPointInGeoJsonInput(page: Page) {
  const map = geoJSONJsonObjectField(page).locator("[data-loaded]");
  await map.waitFor({ state: "attached" });
  await map.hover({ force: true });
  const markerControl = map.locator('button[title="Marker"]');
  await markerControl.waitFor({ state: "attached", timeout: 30_000 });
  await markerControl.click({ force: true });
  const mapCanvas = map.locator(".maplibregl-canvas");
  await mapCanvas.waitFor({ state: "attached" });
  await mapCanvas.click({ position: { x: 500, y: 100 }, force: true });
}

import { expect, test } from "@playwright/test";
import { DateTime } from "luxon";
import WeighIns from "../fixtures/WeighIns.js";
import createCollection from "../utils/createCollection.js";

test("Create a collection and insert a document", async ({ page }) => {
  await page.goto("/");

  // Create collection.
  await createCollection(page, WeighIns);

  // Create document.
  await page.getByRole("link", { name: "Create document" }).click();
  await expect(page.getByText("DatePlainDate (String)")).toBeVisible();
  await expect(page.getByText("mm/dd/yyyy")).toBeVisible();
  await page.getByRole("button", { name: /Calendar DatePlainDate / }).click();
  await page.getByRole("gridcell", { name: /Today/i }).click();
  await page.locator("#weight").fill("70");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("gridcell", { name: WeighIns.name }).click();

  // Expect document created correctly
  await expect(
    page.getByRole("rowheader", { name: DateTime.now().toISODate() }),
  ).toBeVisible();
});

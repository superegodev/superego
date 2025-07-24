import { expect, test } from "@playwright/test";

import dateCollection from '../fixtures/date/collection.json' with { type: 'json' }
import { createCollection, getValueGetterContent } from "./collection.utils";

test("create a collection and insert data", async ({ page }) => {
  const collectionName = dateCollection.rootType;
  await page.goto("/");
  await createCollection(page, {
    name: collectionName,
    schema: dateCollection,
    valueGetter: getValueGetterContent('../fixtures/date/value-getter.ts'),
  });

  // Create document
  await page.getByRole("link", { name: "Create document" }).click();
  await expect(page.getByText("DatePlainDate (String)")).toBeVisible();
  await expect(page.getByText("mm/dd/yyyy")).toBeVisible();
  await page.getByRole("button", { name: "Calendar DatePlainDate (" }).click();
  await page.getByRole("gridcell", { name: /Today/i }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByText(collectionName, { exact: true }).click();

  // Expect document created correctly
  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth() + 1
  await expect(page.getByRole("rowheader", { name: `${month}-${day}` })).toBeVisible();
});

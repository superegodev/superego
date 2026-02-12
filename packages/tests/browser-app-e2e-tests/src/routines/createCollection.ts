import type { Page } from "@playwright/test";
import type { CollectionDefinition } from "@superego/backend";

/**
 * Creates a collection.
 *
 * Starts: anywhere.
 * Ends: newly-created collection page.
 */
export default async function createCollection(
  page: Page,
  collection: CollectionDefinition,
) {
  // Ensure the browser app is loaded so the in-browser backend is available.
  await page.goto("/");
  await page.waitForFunction(() => Boolean((window as any).backend));

  // Programmatically create the collection.
  const collectionId = await page.evaluate(async (definition) => {
    const backend = (window as any).backend;
    const result = await backend.collections.create(definition);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error));
    }
    return result.data.id;
  }, collection);

  // Go to the collection page.
  await page.goto(`/collections/${collectionId}`);
  await page.getByRole("link", { name: /Create document/i }).waitFor();
}

import type { Page } from "@playwright/test";
import type { CollectionDefinition } from "@superego/backend";

/**
 * Programmatically creates a collection via the in-browser backend API.
 *
 * Returns the new collection's ID. Does not navigate.
 */
export default async function createCollection(
  page: Page,
  collection: CollectionDefinition,
): Promise<string> {
  // Ensure the browser app is loaded so the in-browser backend is available.
  await page.goto("/");
  await page.waitForFunction(() => Boolean((window as any).backend));

  // Programmatically create the collection.
  return page.evaluate(async (definition) => {
    const backend = (window as any).backend;
    const result = await backend.collections.create(definition);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error));
    }
    return result.data.id as string;
  }, collection);
}

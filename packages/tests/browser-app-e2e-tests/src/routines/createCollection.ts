import type { Page } from "@playwright/test";
import type { CollectionDefinition } from "@superego/backend";

export default async function createCollection(
  page: Page,
  collection: CollectionDefinition,
): Promise<string> {
  return page.evaluate(async (definition) => {
    const backend = (window as any).backend;
    const result = await backend.collections.create(definition);

    if (!result.success) {
      throw new Error(JSON.stringify(result.error));
    }

    return result.data.id as string;
  }, collection);
}

import type {
  App,
  Collection,
  CollectionCategory,
  Document,
} from "@superego/backend";
import type { ExecutingBackend } from "@superego/executing-backend";
import { assert } from "vitest";

export interface DatabaseSnapshot {
  categories: CollectionCategory[];
  collections: Collection[];
  documentsByCollectionId: Record<string, Document[]>;
  apps: App[];
}

export async function readDatabaseSnapshot(
  backend: ExecutingBackend,
): Promise<DatabaseSnapshot> {
  const categoriesResult = await backend.collectionCategories.list();
  assert.isTrue(categoriesResult.success);
  const collectionsResult = await backend.collections.list();
  assert.isTrue(collectionsResult.success);
  const appsResult = await backend.apps.list();
  assert.isTrue(appsResult.success);

  const documentsByCollectionId: Record<string, Document[]> = {};
  for (const collection of collectionsResult.data) {
    const documentsResult = await backend.documents.list(collection.id, false);
    assert.isTrue(documentsResult.success);
    documentsByCollectionId[collection.id] = documentsResult.data as Document[];
  }

  return {
    categories: categoriesResult.data,
    collections: collectionsResult.data,
    documentsByCollectionId,
    apps: appsResult.data,
  };
}

export function stableSnapshot(snapshot: DatabaseSnapshot): string {
  return JSON.stringify(
    {
      categories: snapshot.categories.map((category) => ({
        id: category.id,
        name: category.name,
        parentId: category.parentId,
      })),
      collections: snapshot.collections.map((collection) => ({
        id: collection.id,
        name: collection.settings.name,
        schema: collection.latestVersion.schema,
      })),
      documentsByCollectionId: Object.fromEntries(
        Object.entries(snapshot.documentsByCollectionId).map(
          ([collectionId, documents]) => [
            collectionId,
            documents.map((document) => ({
              id: document.id,
              content: document.latestVersion.content,
            })),
          ],
        ),
      ),
      apps: snapshot.apps.map((app) => ({
        id: app.id,
        name: app.name,
        targetCollections: app.latestVersion.targetCollections,
        source: app.latestVersion.files["/main.tsx"],
      })),
    },
    null,
    2,
  );
}

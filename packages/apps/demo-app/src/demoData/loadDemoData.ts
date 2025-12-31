import type {
  AppVersion,
  Backend,
  CollectionCategoryId,
  CollectionId,
  CollectionVersionId,
} from "@superego/backend";
import demoData from "./demoData.js";
import type { DemoCollection } from "./types.js";

export type LoadDemoDataProgress = {
  current: number;
  total: number;
  message: string;
};

export default async function loadDemoData(
  backend: Backend,
  onProgress: (progress: LoadDemoDataProgress) => void,
): Promise<void> {
  const { collectionCategories, collections } = demoData;

  const totalDocumentCount = collections.reduce(
    (sum, collection) => sum + collection.documents.length,
    0,
  );
  const totalAppCount = collections.filter(
    (collection) => collection.app,
  ).length;
  const totalOperations =
    collectionCategories.length +
    collections.length +
    totalDocumentCount +
    totalAppCount;
  let currentOperation = 0;

  // Create collection categories.
  const categoryIdsByName = new Map<string, CollectionCategoryId>();
  for (const category of collectionCategories) {
    currentOperation++;
    onProgress({
      current: currentOperation,
      total: totalOperations,
      message: "Creating collection categories",
    });
    const result = await backend.collectionCategories.create({
      name: category.name,
      icon: category.icon,
      parentId: category.parentId,
    });
    if (result.success) {
      categoryIdsByName.set(category.name, result.data.id);
    } else {
      console.error("Failed to create category", category.name, result.error);
    }
  }

  // Create collections.
  const createdCollectionIds = new Map<
    DemoCollection,
    { collectionId: CollectionId; collectionVersionId: CollectionVersionId }
  >();
  for (const collection of collections) {
    currentOperation++;
    onProgress({
      current: currentOperation,
      total: totalOperations,
      message: "Creating collections",
    });

    const result = await backend.collections.create(
      {
        ...collection.settings,
        collectionCategoryId: collection.categoryName
          ? (categoryIdsByName.get(collection.categoryName) ?? null)
          : null,
        defaultCollectionViewAppId: null,
      },
      collection.schema,
      collection.versionSettings,
    );

    if (result.success) {
      createdCollectionIds.set(collection, {
        collectionId: result.data.id,
        collectionVersionId: result.data.latestVersion.id,
      });
    } else {
      console.error(
        "Failed to create collection",
        collection.settings.name,
        result.error,
      );
    }
  }

  // Create documents.
  let documentIndex = 0;
  for (const collection of collections) {
    const collectionIds = createdCollectionIds.get(collection);
    if (!collectionIds) {
      continue;
    }

    for (const documentContent of collection.documents) {
      documentIndex++;
      currentOperation++;
      onProgress({
        current: currentOperation,
        total: totalOperations,
        message: `Creating document ${documentIndex} of ${totalDocumentCount}`,
      });
      const result = await backend.documents.create(
        collectionIds.collectionId,
        documentContent,
      );
      if (!result.success) {
        console.error("Failed to create document", documentIndex, result.error);
      }
    }
  }

  // Create apps and link to collections.
  for (const collection of collections) {
    const collectionIds = createdCollectionIds.get(collection);
    if (!collectionIds || !collection.app) {
      continue;
    }

    currentOperation++;
    onProgress({
      current: currentOperation,
      total: totalOperations,
      message: "Creating apps",
    });

    // Replace placeholders in app files with actual IDs
    const appFiles = Object.fromEntries(
      Object.entries(collection.app.files).map(([filePath, fileContent]) => [
        filePath,
        {
          source: fileContent.source
            .replaceAll("$COLLECTION_ID", collectionIds.collectionId)
            .replaceAll(
              "$COLLECTION_VERSION_ID",
              collectionIds.collectionVersionId,
            ),
          compiled: fileContent.compiled
            .replaceAll("$COLLECTION_ID", collectionIds.collectionId)
            .replaceAll(
              "$COLLECTION_VERSION_ID",
              collectionIds.collectionVersionId,
            ),
        },
      ]),
    ) as AppVersion["files"];

    const appResult = await backend.apps.create(
      collection.app.type,
      collection.app.name,
      [collectionIds.collectionId],
      appFiles,
    );

    // Set as default collection view app
    if (appResult.success) {
      await backend.collections.updateSettings(collectionIds.collectionId, {
        defaultCollectionViewAppId: appResult.data.id,
      });
    } else {
      console.error(
        "Failed to create app",
        collection.app.name,
        appResult.error,
      );
    }
  }
}

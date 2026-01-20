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
    const createCollectionCategoryResult =
      await backend.collectionCategories.create({
        name: category.name,
        icon: category.icon,
        parentId: category.parentId,
      });
    if (createCollectionCategoryResult.success) {
      categoryIdsByName.set(
        category.name,
        createCollectionCategoryResult.data.id,
      );
    } else {
      console.error(
        "Failed to create category",
        category.name,
        createCollectionCategoryResult.error,
      );
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

    const createCollectionResult = await backend.collections.create(
      {
        ...collection.settings,
        collectionCategoryId: collection.categoryName
          ? (categoryIdsByName.get(collection.categoryName) ?? null)
          : null,
        defaultCollectionViewAppId: null,
      },
      collection.schema,
      collection.versionSettings,
      collection.contentFingerprintGetter,
    );

    if (createCollectionResult.success) {
      createdCollectionIds.set(collection, {
        collectionId: createCollectionResult.data.id,
        collectionVersionId: createCollectionResult.data.latestVersion.id,
      });
    } else {
      console.error(
        "Failed to create collection",
        collection.settings.name,
        createCollectionResult.error,
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
      const createDocumentResult = await backend.documents.create(
        collectionIds.collectionId,
        documentContent,
      );
      if (!createDocumentResult.success) {
        console.error(
          "Failed to create document",
          documentIndex,
          createDocumentResult.error,
        );
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

    const createAppResult = await backend.apps.create(
      collection.app.type,
      collection.app.name,
      [collectionIds.collectionId],
      appFiles,
    );

    // Set as default collection view app
    if (createAppResult.success) {
      const updateCollectionResult = await backend.collections.updateSettings(
        collectionIds.collectionId,
        { defaultCollectionViewAppId: createAppResult.data.id },
      );
      if (!updateCollectionResult.success) {
        console.error(
          "Failed to set default app for collection",
          collection.settings.name,
          updateCollectionResult.error,
        );
      }
    } else {
      console.error(
        "Failed to create app",
        collection.app.name,
        createAppResult.error,
      );
    }
  }
}

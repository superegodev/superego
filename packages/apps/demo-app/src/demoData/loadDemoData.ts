// TODO: With document references, this file got quite complex and has
// vibe coded parts that are quite messy. Refactor for "marketing round 2", also
// changing the demo data (add period collection + app, meals app, etc ).
import type {
  AppVersion,
  Backend,
  CollectionCategoryId,
  CollectionId,
  CollectionVersionId,
  DocumentId,
} from "@superego/backend";
import { utils as schemaUtils } from "@superego/schema";
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
    // Collections are created in 1 batch via createMany, so it counts as one.
    1 +
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
  currentOperation++;
  onProgress({
    current: currentOperation,
    total: totalOperations,
    message: "Creating collections",
  });

  const createCollectionsResult = await backend.collections.createMany(
    collections.map((collection) => ({
      settings: {
        ...collection.settings,
        collectionCategoryId: collection.categoryName
          ? (categoryIdsByName.get(collection.categoryName) ?? null)
          : null,
        defaultCollectionViewAppId: null,
      },
      schema: collection.schema,
      versionSettings: collection.versionSettings,
    })),
  );

  if (!createCollectionsResult.success) {
    console.error(
      "Failed to create collections",
      createCollectionsResult.error,
    );
    return;
  }

  const createdCollections = createCollectionsResult.data;
  const createdCollectionIds = new Map<
    DemoCollection,
    { collectionId: CollectionId; collectionVersionId: CollectionVersionId }
  >();

  // Build a mapping from ProtoCollection_<index> to actual collection IDs.
  // This is used to resolve collection references in document content.
  const protoCollectionIdMapping = schemaUtils.makeProtoCollectionIdMapping(
    createdCollections.map((c) => c.id),
  );

  // Build a reverse mapping from actual collection ID to collection index.
  // This is used to resolve document references by looking up which collection
  // a document ref points to.
  const collectionIndexById = new Map<string, number>();

  for (const [index, collection] of collections.entries()) {
    const createdCollection = createdCollections[index];
    if (createdCollection) {
      createdCollectionIds.set(collection, {
        collectionId: createdCollection.id,
        collectionVersionId: createdCollection.latestVersion.id,
      });
      collectionIndexById.set(createdCollection.id, index);
    }
  }

  // Create documents and track document IDs by collection index for resolving
  // ProtoDocument references.
  const documentIdsByCollectionIndex = new Map<number, DocumentId[]>();

  let documentIndex = 0;
  for (const [collectionIndex, collection] of collections.entries()) {
    const collectionIds = createdCollectionIds.get(collection);
    if (!collectionIds) {
      continue;
    }

    const collectionDocumentIds: DocumentId[] = [];
    documentIdsByCollectionIndex.set(collectionIndex, collectionDocumentIds);

    for (const documentContent of collection.documents) {
      documentIndex++;
      currentOperation++;
      onProgress({
        current: currentOperation,
        total: totalOperations,
        message: `Creating document ${documentIndex} of ${totalDocumentCount}`,
      });

      // Replace ProtoCollection and ProtoDocument references in document content.
      let resolvedContent = documentContent;

      // First, replace ProtoCollection_<index> with actual collection IDs.
      resolvedContent = replaceProtoCollectionIdsInContent(
        resolvedContent,
        protoCollectionIdMapping,
      );

      // Then, replace ProtoDocument_<index> with actual document IDs.
      // Extract document refs with both collectionId and documentId so we can
      // look up the correct collection for each reference.
      const protoDocumentRefs = extractProtoDocumentRefs(resolvedContent);

      if (protoDocumentRefs.length > 0) {
        // Build a mapping from ProtoDocument_<index> to actual document IDs.
        const docIdMapping = new Map<string, string>();
        for (const ref of protoDocumentRefs) {
          const docIndex = schemaUtils.parseProtoDocumentIndex(ref.documentId);
          if (docIndex !== null) {
            // Use the collectionId to find the correct collection index.
            const refCollectionIndex = collectionIndexById.get(
              ref.collectionId,
            );
            if (refCollectionIndex !== undefined) {
              const docIds =
                documentIdsByCollectionIndex.get(refCollectionIndex);
              const actualDocId = docIds?.[docIndex];
              if (actualDocId !== undefined) {
                docIdMapping.set(ref.documentId, actualDocId);
              }
            }
          }
        }

        resolvedContent = schemaUtils.replaceProtoDocumentIds(
          collection.schema,
          resolvedContent,
          docIdMapping,
        );
      }

      const createDocumentResult = await backend.documents.create(
        collectionIds.collectionId,
        resolvedContent,
      );

      if (createDocumentResult.success) {
        collectionDocumentIds.push(createDocumentResult.data.id);
      } else {
        console.error(
          "Failed to create document",
          documentIndex,
          createDocumentResult.error,
        );
        // Still push a placeholder to maintain index alignment.
        collectionDocumentIds.push("" as DocumentId);
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

function replaceProtoCollectionIdsInContent(
  content: unknown,
  idMapping: Map<string, string>,
): unknown {
  if (content === null || content === undefined) {
    return content;
  }

  if (typeof content === "string") {
    return idMapping.get(content) ?? content;
  }

  if (Array.isArray(content)) {
    return content.map((item) =>
      replaceProtoCollectionIdsInContent(item, idMapping),
    );
  }

  if (typeof content === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(content)) {
      result[key] = replaceProtoCollectionIdsInContent(value, idMapping);
    }
    return result;
  }

  return content;
}

type ProtoDocumentRef = {
  collectionId: string;
  documentId: string;
};

/**
 * Extracts all document refs where the documentId is a ProtoDocument placeholder.
 * Returns both the collectionId and documentId so we can look up the correct
 * collection when resolving the reference.
 */
function extractProtoDocumentRefs(content: unknown): ProtoDocumentRef[] {
  const refs: ProtoDocumentRef[] = [];
  _extractProtoDocumentRefs(content, refs);
  return refs;
}

function _extractProtoDocumentRefs(
  content: unknown,
  refs: ProtoDocumentRef[],
): void {
  if (content === null || content === undefined) {
    return;
  }

  if (Array.isArray(content)) {
    for (const item of content) {
      _extractProtoDocumentRefs(item, refs);
    }
    return;
  }

  if (typeof content === "object") {
    const obj = content as Record<string, unknown>;
    const collectionId = obj["collectionId"];
    const documentId = obj["documentId"];
    // Check if this is a document ref with a proto document ID.
    if (
      typeof collectionId === "string" &&
      typeof documentId === "string" &&
      schemaUtils.isProtoDocumentId(documentId)
    ) {
      refs.push({ collectionId, documentId });
    }
    // Recurse into all properties.
    for (const value of Object.values(obj)) {
      _extractProtoDocumentRefs(value, refs);
    }
  }
}

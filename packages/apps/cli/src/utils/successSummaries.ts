import type {
  Collection,
  CollectionCategory,
  Document,
} from "@superego/backend";

export interface DocumentSuccessSummary {
  id: Document["id"];
  collectionId: Document["collectionId"];
  collectionVersionId: Document["latestVersion"]["collectionVersionId"];
  latestVersionId: Document["latestVersion"]["id"];
  previousVersionId: Document["latestVersion"]["previousVersionId"];
}

export interface CollectionSuccessSummary {
  id: Collection["id"];
  latestVersionId: Collection["latestVersion"]["id"];
  previousVersionId: Collection["latestVersion"]["previousVersionId"];
}

export interface CollectionCategorySuccessSummary {
  id: CollectionCategory["id"];
}

export function summarizeDocument(document: Document): DocumentSuccessSummary {
  return {
    id: document.id,
    collectionId: document.collectionId,
    collectionVersionId: document.latestVersion.collectionVersionId,
    latestVersionId: document.latestVersion.id,
    previousVersionId: document.latestVersion.previousVersionId,
  };
}

export function summarizeDocuments(
  documents: Document[],
): DocumentSuccessSummary[] {
  return documents.map(summarizeDocument);
}

export function summarizeCollection(
  collection: Collection,
): CollectionSuccessSummary {
  return {
    id: collection.id,
    latestVersionId: collection.latestVersion.id,
    previousVersionId: collection.latestVersion.previousVersionId,
  };
}

export function summarizeCollections(
  collections: Collection[],
): CollectionSuccessSummary[] {
  return collections.map(summarizeCollection);
}

export function summarizeCollectionCategory(
  collectionCategory: CollectionCategory,
): CollectionCategorySuccessSummary {
  return { id: collectionCategory.id };
}

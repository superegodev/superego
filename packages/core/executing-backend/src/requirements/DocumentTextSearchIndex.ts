import type { CollectionId, DocumentId } from "@superego/backend";

export default interface DocumentTextSearchIndex {
  upsert(
    collectionId: CollectionId,
    documentId: DocumentId,
    textChunks: {
      [path: string]: string[];
    },
  ): Promise<void>;
  remove(collectionId: CollectionId, documentId: DocumentId): Promise<void>;
  search(
    collectionId: CollectionId | null,
    query: string,
  ): Promise<
    {
      collectionId: CollectionId;
      documentId: DocumentId;
      matchedText: string;
    }[]
  >;
}

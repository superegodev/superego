import type { CollectionId, DocumentId } from "@superego/backend";
import type { TextChunks } from "@superego/schema";

export default interface DocumentTextSearchIndex {
  upsert(
    collectionId: CollectionId,
    documentId: DocumentId,
    textChunks: TextChunks,
  ): Promise<void>;
  remove(collectionId: CollectionId, documentId: DocumentId): Promise<void>;
  search(
    collectionId: CollectionId | null,
    query: string,
    options: { limit: number },
  ): Promise<
    {
      collectionId: CollectionId;
      documentId: DocumentId;
      matchedText: string;
    }[]
  >;
}

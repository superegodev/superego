import type { CollectionId, DocumentId } from "@superego/backend";

export default class DocumentDoesNotExist extends Error {
  override name = "DocumentDoesNotExist";
  constructor(
    public collectionId: CollectionId,
    public documentId: DocumentId,
  ) {
    super(
      `Document ${documentId} in collection ${collectionId} does not exist`,
    );
  }
}

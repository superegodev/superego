import type {
  CollectionId,
  CollectionVersionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";

export default class DocumentVersionCollectionVersionMismatch extends Error {
  override name = "DocumentVersionCollectionVersionMismatch";
  constructor(
    public collectionId: CollectionId,
    public collectionVersionId: CollectionVersionId,
    public documentId: DocumentId,
    public documentVersionId: DocumentVersionId,
  ) {
    super(
      `Document version ${documentVersionId} doesn't match collection version ${collectionVersionId}`,
    );
  }
}

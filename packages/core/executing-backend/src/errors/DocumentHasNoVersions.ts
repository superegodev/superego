import type { CollectionId, DocumentId } from "@superego/backend";

export default class DocumentHasNoVersions extends Error {
  override name = "DocumentHasNoVersions";
  constructor(
    public collectionId: CollectionId,
    public documentId: DocumentId,
  ) {
    super(
      `Document ${documentId} in collection ${collectionId} has no versions`,
    );
  }
}

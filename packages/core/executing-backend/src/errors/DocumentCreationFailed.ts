import type { CollectionId } from "@superego/backend";

export default class DocumentCreationFailed extends Error {
  override name = "DocumentCreationFailed";
  constructor(
    public collectionId: CollectionId,
    public documentContent: any,
  ) {
    super(`Failed to create document in collection ${collectionId}`);
  }
}

import type { CollectionId, CollectionVersionId } from "@superego/backend";

export default class CollectionVersionHasNoRemoteConverters extends Error {
  override name = "CollectionVersionHasNoRemoteConverters";
  constructor(
    public collectionId: CollectionId,
    public collectionVersionId: CollectionVersionId,
  ) {
    super(
      `Version ${collectionVersionId} of collection ${collectionId} has no remoteConverters.`,
    );
  }
}

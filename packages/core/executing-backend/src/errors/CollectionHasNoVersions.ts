import type { CollectionId } from "@superego/backend";

export default class CollectionHasNoVersions extends Error {
  override name = "CollectionHasNoVersions";
  constructor(public collectionId: CollectionId) {
    super(`Collection ${collectionId} has no versions`);
  }
}

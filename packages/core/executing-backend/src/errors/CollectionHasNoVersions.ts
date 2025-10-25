import type { CollectionId } from "@superego/backend";

// TODO: this error is used in situations in which the collection might have a
// version, but a non-existing version was searched. Hence, it probably needs
// renaming / more info.
export default class CollectionHasNoVersions extends Error {
  override name = "CollectionHasNoVersions";
  constructor(public collectionId: CollectionId) {
    super(`Collection ${collectionId} has no versions`);
  }
}

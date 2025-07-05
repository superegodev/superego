import type { CollectionId } from "@superego/backend";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import CollectionHasNoVersions from "../errors/CollectionHasNoVersions.js";

export default function assertCollectionVersionExists(
  collectionId: CollectionId,
  collectionVersion: CollectionVersionEntity | null | undefined,
): asserts collectionVersion is CollectionVersionEntity {
  if (collectionVersion === null || collectionVersion === undefined) {
    throw new CollectionHasNoVersions(collectionId);
  }
}

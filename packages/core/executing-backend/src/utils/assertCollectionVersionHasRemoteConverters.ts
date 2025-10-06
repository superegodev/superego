import type { RemoteConverters } from "@superego/backend";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import CollectionVersionHasNoRemoteConverters from "../errors/CollectionVersionHasNoRemoteConverters.js";

export default function assertCollectionVersionHasRemoteConverters(
  collectionVersion: CollectionVersionEntity,
): asserts collectionVersion is CollectionVersionEntity & {
  remoteConverters: RemoteConverters;
} {
  if (collectionVersion.remoteConverters === null) {
    throw new CollectionVersionHasNoRemoteConverters(
      collectionVersion.collectionId,
      collectionVersion.id,
    );
  }
}

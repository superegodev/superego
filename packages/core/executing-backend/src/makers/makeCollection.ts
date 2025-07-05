import type { Collection } from "@superego/backend";
import type CollectionEntity from "../entities/CollectionEntity.js";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import makeCollectionVersion from "./makeCollectionVersion.js";

export default function makeCollection(
  collection: CollectionEntity,
  latestVersion: CollectionVersionEntity,
): Collection {
  return {
    id: collection.id,
    latestVersion: makeCollectionVersion(latestVersion),
    settings: collection.settings,
    createdAt: collection.createdAt,
  };
}

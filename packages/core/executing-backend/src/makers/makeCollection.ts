import type { Collection } from "@superego/backend";
import type CollectionEntity from "../entities/CollectionEntity.js";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import type Connector from "../requirements/Connector.js";
import makeCollectionVersion from "./makeCollectionVersion.js";
import makeRemote from "./makeRemote.js";

export default function makeCollection(
  collection: CollectionEntity,
  latestVersion: CollectionVersionEntity,
  connector: Connector | null,
): Collection {
  return {
    id: collection.id,
    latestVersion: makeCollectionVersion(latestVersion),
    settings: collection.settings,
    remote:
      collection.remote && connector
        ? makeRemote(collection.remote, connector)
        : null,
    createdAt: collection.createdAt,
  };
}

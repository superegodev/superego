import type { Collection, LiteCollection } from "@superego/backend";
import makeLiteCollectionVersion from "./makeLiteCollectionVersion.js";

export default function makeLiteCollection(
  collection: Collection,
): LiteCollection {
  return {
    ...collection,
    latestVersion: makeLiteCollectionVersion(collection.latestVersion),
  };
}

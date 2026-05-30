import type Collection from "./Collection.js";
import type LiteCollectionVersion from "./LiteCollectionVersion.js";

type LiteCollection = Omit<Collection, "latestVersion"> & {
  latestVersion: LiteCollectionVersion;
};
export default LiteCollection;

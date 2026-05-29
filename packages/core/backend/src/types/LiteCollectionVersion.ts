import type CollectionVersion from "./CollectionVersion.js";

type LiteCollectionVersion = Pick<
  CollectionVersion,
  "id" | "previousVersionId" | "createdAt"
>;
export default LiteCollectionVersion;

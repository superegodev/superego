import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";
import type RpcError from "../types/RpcError.js";

type CollectionVersionIdNotMatching = RpcError<
  "CollectionVersionIdNotMatching",
  {
    collectionId: CollectionId;
    latestVersionId: CollectionVersionId;
    suppliedVersionId: CollectionVersionId;
  }
>;
export default CollectionVersionIdNotMatching;

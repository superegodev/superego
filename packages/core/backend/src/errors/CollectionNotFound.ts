import type CollectionId from "../ids/CollectionId.js";
import type RpcError from "../types/RpcError.js";

type CollectionNotFound = RpcError<
  "CollectionNotFound",
  {
    collectionId: CollectionId;
  }
>;
export default CollectionNotFound;

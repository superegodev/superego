import type CollectionCategoryId from "../ids/CollectionCategoryId.js";
import type RpcError from "../types/RpcError.js";

type CollectionCategoryNotFound = RpcError<
  "CollectionCategoryNotFound",
  {
    collectionCategoryId: CollectionCategoryId;
  }
>;
export default CollectionCategoryNotFound;

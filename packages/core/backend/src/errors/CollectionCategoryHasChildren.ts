import type CollectionCategoryId from "../ids/CollectionCategoryId.js";
import type RpcError from "../types/RpcError.js";

type CollectionCategoryHasChildren = RpcError<
  "CollectionCategoryHasChildren",
  {
    collectionCategoryId: CollectionCategoryId;
  }
>;
export default CollectionCategoryHasChildren;

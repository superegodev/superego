import type CollectionCategoryId from "../ids/CollectionCategoryId.js";
import type RpcError from "../types/RpcError.js";

type ParentCollectionCategoryNotFound = RpcError<
  "ParentCollectionCategoryNotFound",
  {
    parentId: CollectionCategoryId;
  }
>;
export default ParentCollectionCategoryNotFound;

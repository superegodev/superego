import type CollectionCategoryId from "../ids/CollectionCategoryId.js";
import type RpcError from "../types/RpcError.js";

type ParentCollectionCategoryIsDescendant = RpcError<
  "ParentCollectionCategoryIsDescendant",
  {
    parentId: CollectionCategoryId;
  }
>;
export default ParentCollectionCategoryIsDescendant;

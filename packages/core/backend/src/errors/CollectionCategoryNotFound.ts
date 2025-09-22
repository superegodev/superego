import type { ResultError } from "@superego/global-types";
import type CollectionCategoryId from "../ids/CollectionCategoryId.js";

type CollectionCategoryNotFound = ResultError<
  "CollectionCategoryNotFound",
  {
    collectionCategoryId: CollectionCategoryId;
  }
>;
export default CollectionCategoryNotFound;

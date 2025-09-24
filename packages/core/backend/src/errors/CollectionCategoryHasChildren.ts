import type { ResultError } from "@superego/global-types";
import type CollectionCategoryId from "../ids/CollectionCategoryId.js";

type CollectionCategoryHasChildren = ResultError<
  "CollectionCategoryHasChildren",
  {
    collectionCategoryId: CollectionCategoryId;
  }
>;
export default CollectionCategoryHasChildren;

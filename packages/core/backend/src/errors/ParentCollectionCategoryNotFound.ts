import type { ResultError } from "@superego/global-types";
import type CollectionCategoryId from "../ids/CollectionCategoryId.js";

type ParentCollectionCategoryNotFound = ResultError<
  "ParentCollectionCategoryNotFound",
  {
    parentId: CollectionCategoryId;
  }
>;
export default ParentCollectionCategoryNotFound;

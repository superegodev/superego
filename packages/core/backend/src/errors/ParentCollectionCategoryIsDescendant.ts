import type { ResultError } from "@superego/global-types";
import type CollectionCategoryId from "../ids/CollectionCategoryId.js";

type ParentCollectionCategoryIsDescendant = ResultError<
  "ParentCollectionCategoryIsDescendant",
  {
    parentId: CollectionCategoryId;
  }
>;
export default ParentCollectionCategoryIsDescendant;

import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type CollectionNotFound = ResultError<
  "CollectionNotFound",
  {
    collectionId: CollectionId;
  }
>;
export default CollectionNotFound;

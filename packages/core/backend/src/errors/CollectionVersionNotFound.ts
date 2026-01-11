import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";

type CollectionVersionNotFound = ResultError<
  "CollectionVersionNotFound",
  {
    collectionId: CollectionId;
    collectionVersionId: CollectionVersionId;
  }
>;
export default CollectionVersionNotFound;

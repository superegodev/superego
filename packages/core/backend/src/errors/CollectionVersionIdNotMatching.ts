import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";

type CollectionVersionIdNotMatching = ResultError<
  "CollectionVersionIdNotMatching",
  {
    collectionId: CollectionId;
    latestVersionId: CollectionVersionId;
    suppliedVersionId: CollectionVersionId;
  }
>;
export default CollectionVersionIdNotMatching;

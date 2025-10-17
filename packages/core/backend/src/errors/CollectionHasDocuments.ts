import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type CollectionHasDocuments = ResultError<
  "CollectionHasDocuments",
  {
    collectionId: CollectionId;
  }
>;
export default CollectionHasDocuments;

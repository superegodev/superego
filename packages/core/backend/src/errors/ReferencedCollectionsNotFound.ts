import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type ReferencedCollectionsNotFound = ResultError<
  "ReferencedCollectionsNotFound",
  {
    /** The collection being created or updated. Null for new collections. */
    collectionId: CollectionId | null;
    /** Collection IDs referenced in the schema that do not exist. */
    notFoundCollectionIds: string[];
  }
>;
export default ReferencedCollectionsNotFound;

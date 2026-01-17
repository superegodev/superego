import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type CollectionIsReferenced = ResultError<
  "CollectionIsReferenced",
  {
    /** The collection that cannot be deleted. */
    collectionId: CollectionId;
    /** Collections whose schemas reference this collection via DocumentRef. */
    referencingCollectionIds: CollectionId[];
  }
>;
export default CollectionIsReferenced;

import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type CollectionIsSyncing = ResultError<
  "CollectionIsSyncing",
  {
    collectionId: CollectionId;
  }
>;
export default CollectionIsSyncing;

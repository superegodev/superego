import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type SyncingChangesFailed = ResultError<
  "SyncingChangesFailed",
  {
    collectionId: CollectionId;
    errors: ResultError<any, any>[];
  }
>;
export default SyncingChangesFailed;

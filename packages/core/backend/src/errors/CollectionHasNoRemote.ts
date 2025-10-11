import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type CollectionHasNoRemote = ResultError<
  "CollectionHasNoRemote",
  {
    collectionId: CollectionId;
  }
>;
export default CollectionHasNoRemote;

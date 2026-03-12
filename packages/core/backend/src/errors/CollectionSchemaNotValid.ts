import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type ProtoCollectionId from "../ids/ProtoCollectionId.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type CollectionSchemaNotValid = ResultError<
  "CollectionSchemaNotValid",
  {
    collectionId: CollectionId | ProtoCollectionId | null;
    issues: ValidationIssue[];
  }
>;
export default CollectionSchemaNotValid;

import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type RemoteConvertersNotValid = ResultError<
  "RemoteConvertersNotValid",
  {
    collectionId: CollectionId;
    issues: ValidationIssue[];
  }
>;
export default RemoteConvertersNotValid;

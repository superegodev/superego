import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

import type ValidationIssue from "../types/ValidationIssue.js";

type CollectionSettingsNotValid = ResultError<
  "CollectionSettingsNotValid",
  {
    collectionId: CollectionId | null;
    issues: ValidationIssue[];
  }
>;
export default CollectionSettingsNotValid;

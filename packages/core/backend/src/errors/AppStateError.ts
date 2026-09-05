import type { ResultError } from "@superego/global-types";

type AppStateError = ResultError<
  "AppStateError",
  {
    reason:
      | "StateNotDefined"
      | "SchemaNotValid"
      | "ContentNotValid"
      | "RevisionConflict"
      | "ObsoleteSchema"
      | "ObsoleteVersion"
      | "MigrationRequired"
      | "MigrationFailed"
      | "SchemaRemovalNotAllowed";
  }
>;
export default AppStateError;

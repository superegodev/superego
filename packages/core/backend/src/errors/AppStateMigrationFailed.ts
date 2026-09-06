import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";
import type AppStateContentNotValid from "./AppStateContentNotValid.js";
import type ExecutingTypescriptFunctionFailed from "./ExecutingTypescriptFunctionFailed.js";
import type UnexpectedError from "./UnexpectedError.js";

type AppStateMigrationFailed = ResultError<
  "AppStateMigrationFailed",
  {
    appId: AppId;
    cause:
      | ExecutingTypescriptFunctionFailed
      | AppStateContentNotValid
      | UnexpectedError;
  }
>;
export default AppStateMigrationFailed;

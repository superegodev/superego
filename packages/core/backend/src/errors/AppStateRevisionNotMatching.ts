import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";

type AppStateRevisionNotMatching = ResultError<
  "AppStateRevisionNotMatching",
  {
    appId: AppId;
    latestRevision: number;
    suppliedRevision: number;
  }
>;
export default AppStateRevisionNotMatching;

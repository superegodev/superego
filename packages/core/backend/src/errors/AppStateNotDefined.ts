import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";

type AppStateNotDefined = ResultError<
  "AppStateNotDefined",
  {
    appId: AppId;
  }
>;
export default AppStateNotDefined;

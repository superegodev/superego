import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";
import type AppVersionId from "../ids/AppVersionId.js";

type AppVersionNotFound = ResultError<
  "AppVersionNotFound",
  {
    appId: AppId;
    appVersionId: AppVersionId;
  }
>;
export default AppVersionNotFound;

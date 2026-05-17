import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";
import type AppVersionId from "../ids/AppVersionId.js";

type AppVersionFileNotFound = ResultError<
  "AppVersionFileNotFound",
  {
    appId: AppId;
    appVersionId: AppVersionId;
    path: string;
  }
>;
export default AppVersionFileNotFound;

import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";
import type AppVersionId from "../ids/AppVersionId.js";

type AppVersionIdNotMatching = ResultError<
  "AppVersionIdNotMatching",
  {
    appId: AppId;
    latestVersionId: AppVersionId;
    suppliedVersionId: AppVersionId;
  }
>;
export default AppVersionIdNotMatching;

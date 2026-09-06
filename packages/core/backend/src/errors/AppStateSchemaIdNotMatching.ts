import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";
import type AppVersionId from "../ids/AppVersionId.js";

type AppStateSchemaIdNotMatching = ResultError<
  "AppStateSchemaIdNotMatching",
  {
    appId: AppId;
    latestSchemaId: AppVersionId;
    suppliedSchemaId: AppVersionId | null;
  }
>;
export default AppStateSchemaIdNotMatching;

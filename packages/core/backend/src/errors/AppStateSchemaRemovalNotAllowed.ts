import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";

type AppStateSchemaRemovalNotAllowed = ResultError<
  "AppStateSchemaRemovalNotAllowed",
  {
    appId: AppId;
  }
>;
export default AppStateSchemaRemovalNotAllowed;

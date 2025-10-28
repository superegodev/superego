import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";

type AppNotFound = ResultError<
  "AppNotFound",
  {
    appId: AppId;
  }
>;
export default AppNotFound;

import * as v from "valibot";
import { idPattern } from "./_internal/idPattern.js";

type AppId = `App_${string}`;
const AppIdSchema = v.pipe(
  v.string(),
  v.regex(idPattern("App")),
) as v.GenericSchema<AppId, AppId>;
export default AppIdSchema;
export type { AppId };

import * as v from "valibot";
import { idPattern } from "./_internal/idPattern.js";

type AppVersionId = `AppVersion_${string}`;
const AppVersionIdSchema = v.pipe(
  v.string(),
  v.regex(idPattern("AppVersion")),
) as v.GenericSchema<AppVersionId, AppVersionId>;
export default AppVersionIdSchema;
export type { AppVersionId };

import * as v from "valibot";
import { idPattern } from "./_internal/idPattern.js";

type BackgroundJobId = `BackgroundJob_${string}`;
const BackgroundJobIdSchema = v.pipe(
  v.string(),
  v.regex(idPattern("BackgroundJob")),
) as v.GenericSchema<BackgroundJobId, BackgroundJobId>;
export default BackgroundJobIdSchema;
export type { BackgroundJobId };

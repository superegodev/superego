import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";

const ExecutingJavascriptFunctionFailedSchema = defineError(
  "ExecutingJavascriptFunctionFailed",
  v.object({
    message: v.string(),
    name: v.optional(v.string()),
    stack: v.optional(v.string()),
  }),
);
export default ExecutingJavascriptFunctionFailedSchema;
export type ExecutingJavascriptFunctionFailed = v.InferOutput<
  typeof ExecutingJavascriptFunctionFailedSchema
>;

import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";

const TypescriptCompilationFailedSchema = defineError(
  "TypescriptCompilationFailed",
  v.union([
    v.object({ reason: v.literal("TypeErrors"), errors: v.string() }),
    v.object({ reason: v.literal("MissingOutput") }),
  ]),
);
export default TypescriptCompilationFailedSchema;
export type TypescriptCompilationFailed = v.InferOutput<
  typeof TypescriptCompilationFailedSchema
>;

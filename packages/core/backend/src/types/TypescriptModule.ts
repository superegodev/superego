import * as v from "valibot";

const TypescriptModuleSchema = v.object({
  source: v.string(),
  compiled: v.string(),
});
export default TypescriptModuleSchema;
export type TypescriptModule = v.InferOutput<typeof TypescriptModuleSchema>;

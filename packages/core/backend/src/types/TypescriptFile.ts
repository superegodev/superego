import * as v from "valibot";

const TypescriptFileSchema = v.object({
  path: v.pipe(v.string(), v.regex(/^\/.+\.tsx?$/)) as v.GenericSchema<
    `/${string}.ts` | `/${string}.tsx`
  >,
  source: v.string(),
});
export default TypescriptFileSchema;
export type TypescriptFile = v.InferOutput<typeof TypescriptFileSchema>;

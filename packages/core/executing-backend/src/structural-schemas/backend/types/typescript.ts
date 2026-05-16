import type { TypescriptFile, TypescriptModule } from "@superego/backend";
import * as v from "valibot";

export function typescriptModule(): v.GenericSchema<unknown, TypescriptModule> {
  return v.strictObject({
    source: v.string(),
    compiled: v.string(),
  });
}

export function typescriptFile(): v.GenericSchema<unknown, TypescriptFile> {
  return v.strictObject({
    path: v.pipe(v.string(), v.regex(/^\/.+\.tsx?$/)) as v.GenericSchema<
      unknown,
      TypescriptFile["path"]
    >,
    source: v.string(),
  });
}

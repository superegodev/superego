import type { ResultError } from "@superego/global-types";
import * as v from "valibot";

export default function unknownResultError(): v.GenericSchema<
  unknown,
  ResultError<string, any>
> {
  return v.strictObject({ name: v.string(), details: v.any() });
}

import type { ResultError } from "@superego/global-types";
import * as v from "valibot";

export default function resultError<Name extends string, Details>(
  name: Name,
  detailsSchema: v.GenericSchema<unknown, Details>,
): v.GenericSchema<unknown, ResultError<Name, Details>> {
  return v.strictObject({
    name: v.literal(name),
    details: detailsSchema,
  }) as v.GenericSchema<unknown, ResultError<Name, Details>>;
}

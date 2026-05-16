import type { ValidationIssue } from "@superego/backend";
import * as v from "valibot";

export default function validationIssue(): v.GenericSchema<
  unknown,
  ValidationIssue
> {
  return v.strictObject({
    message: v.string(),
    path: v.optional(
      v.array(
        v.strictObject({
          key: v.union([v.string(), v.number()]),
        }),
      ),
    ),
  }) as v.GenericSchema<unknown, ValidationIssue>;
}

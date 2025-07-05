import type { ValidationIssue } from "@superego/backend";
import type * as v from "valibot";

export default function makeValidationIssue(
  issue: v.GenericIssue,
): ValidationIssue {
  return {
    message: issue.message,
    path: issue.path?.map(({ key }) => ({
      key: typeof key === "number" ? key : String(key),
    })),
  };
}

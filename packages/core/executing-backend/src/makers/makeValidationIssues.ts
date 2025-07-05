import type { ValidationIssue } from "@superego/backend";
import type * as v from "valibot";
import makeValidationIssue from "./makeValidationIssue.js";

export default function makeValidationIssues(
  issues: v.GenericIssue[],
): ValidationIssue[] {
  return issues.map(makeValidationIssue);
}

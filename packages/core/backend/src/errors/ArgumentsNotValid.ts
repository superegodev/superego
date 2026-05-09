import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const ArgumentsNotValidSchema = defineError(
  "ArgumentsNotValid",
  v.object({ issues: v.array(ValidationIssueSchema) }),
);
export default ArgumentsNotValidSchema;
export type ArgumentsNotValid = v.InferOutput<typeof ArgumentsNotValidSchema>;

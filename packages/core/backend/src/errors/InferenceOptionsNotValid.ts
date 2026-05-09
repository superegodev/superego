import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const InferenceOptionsNotValidSchema = defineError(
  "InferenceOptionsNotValid",
  v.object({ issues: v.array(ValidationIssueSchema) }),
);
export default InferenceOptionsNotValidSchema;
export type InferenceOptionsNotValid = v.InferOutput<
  typeof InferenceOptionsNotValidSchema
>;

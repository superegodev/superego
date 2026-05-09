import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const PackNotValidSchema = defineError(
  "PackNotValid",
  v.object({ issues: v.array(ValidationIssueSchema) }),
);
export default PackNotValidSchema;
export type PackNotValid = v.InferOutput<typeof PackNotValidSchema>;

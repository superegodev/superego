import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const GlobalSettingsNotValidSchema = defineError(
  "GlobalSettingsNotValid",
  v.object({ issues: v.array(ValidationIssueSchema) }),
);
export default GlobalSettingsNotValidSchema;
export type GlobalSettingsNotValid = v.InferOutput<
  typeof GlobalSettingsNotValidSchema
>;

import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const ConnectorSettingsNotValidSchema = defineError(
  "ConnectorSettingsNotValid",
  v.object({
    connectorName: v.string(),
    issues: v.array(ValidationIssueSchema),
  }),
);
export default ConnectorSettingsNotValidSchema;
export type ConnectorSettingsNotValid = v.InferOutput<
  typeof ConnectorSettingsNotValidSchema
>;

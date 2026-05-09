import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const ConnectorAuthenticationSettingsNotValidSchema = defineError(
  "ConnectorAuthenticationSettingsNotValid",
  v.object({
    collectionId: CollectionIdSchema,
    connectorName: v.string(),
    issues: v.array(ValidationIssueSchema),
  }),
);
export default ConnectorAuthenticationSettingsNotValidSchema;
export type ConnectorAuthenticationSettingsNotValid = v.InferOutput<
  typeof ConnectorAuthenticationSettingsNotValidSchema
>;

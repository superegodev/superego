import { valibotSchemas as schemaValibotSchemas } from "@superego/schema";
import * as v from "valibot";
import { ConnectorAuthenticationStrategySchema } from "../enums/ConnectorAuthenticationStrategy.js";

const ConnectorSchema = v.object({
  name: v.string(),
  authenticationStrategy: ConnectorAuthenticationStrategySchema,
  settingsSchema: v.nullable(schemaValibotSchemas.schema()),
  remoteDocumentTypescriptSchema: v.object({
    types: v.string(),
    rootType: v.string(),
  }),
});
export default ConnectorSchema;
export type Connector = v.InferOutput<typeof ConnectorSchema>;

import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";

const ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategySchema = defineError(
  "ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy",
  v.object({
    collectionId: CollectionIdSchema,
    connectorName: v.string(),
  }),
);
export default ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategySchema;
export type ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy = v.InferOutput<
  typeof ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategySchema
>;

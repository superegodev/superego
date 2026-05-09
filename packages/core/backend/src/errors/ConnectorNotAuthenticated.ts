import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";

const ConnectorNotAuthenticatedSchema = defineError(
  "ConnectorNotAuthenticated",
  v.object({
    collectionId: CollectionIdSchema,
    connectorName: v.string(),
  }),
);
export default ConnectorNotAuthenticatedSchema;
export type ConnectorNotAuthenticated = v.InferOutput<
  typeof ConnectorNotAuthenticatedSchema
>;

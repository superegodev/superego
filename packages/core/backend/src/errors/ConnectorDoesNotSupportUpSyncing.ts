import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";

const ConnectorDoesNotSupportUpSyncingSchema = defineError(
  "ConnectorDoesNotSupportUpSyncing",
  v.object({
    collectionId: CollectionIdSchema,
    connectorName: v.string(),
    message: v.string(),
  }),
);
export default ConnectorDoesNotSupportUpSyncingSchema;
export type ConnectorDoesNotSupportUpSyncing = v.InferOutput<
  typeof ConnectorDoesNotSupportUpSyncingSchema
>;

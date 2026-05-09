import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";

const CannotChangeCollectionRemoteConnectorSchema = defineError(
  "CannotChangeCollectionRemoteConnector",
  v.object({
    collectionId: CollectionIdSchema,
    currentConnectorName: v.string(),
    suppliedConnectorName: v.string(),
  }),
);
export default CannotChangeCollectionRemoteConnectorSchema;
export type CannotChangeCollectionRemoteConnector = v.InferOutput<
  typeof CannotChangeCollectionRemoteConnectorSchema
>;

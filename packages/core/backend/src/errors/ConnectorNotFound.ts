import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";

const ConnectorNotFoundSchema = defineError(
  "ConnectorNotFound",
  v.object({
    collectionId: CollectionIdSchema,
    connectorName: v.string(),
  }),
);
export default ConnectorNotFoundSchema;
export type ConnectorNotFound = v.InferOutput<typeof ConnectorNotFoundSchema>;

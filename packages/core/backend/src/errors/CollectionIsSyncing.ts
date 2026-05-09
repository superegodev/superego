import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";

const CollectionIsSyncingSchema = defineError(
  "CollectionIsSyncing",
  v.object({ collectionId: CollectionIdSchema }),
);
export default CollectionIsSyncingSchema;
export type CollectionIsSyncing = v.InferOutput<
  typeof CollectionIsSyncingSchema
>;

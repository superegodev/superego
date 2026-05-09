import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";

const SyncingChangesFailedSchema = defineError(
  "SyncingChangesFailed",
  v.object({
    collectionId: CollectionIdSchema,
    errors: v.array(v.object({ name: v.string(), details: v.any() })),
  }),
);
export default SyncingChangesFailedSchema;
export type SyncingChangesFailed = v.InferOutput<
  typeof SyncingChangesFailedSchema
>;

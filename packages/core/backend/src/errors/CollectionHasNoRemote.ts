import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";

const CollectionHasNoRemoteSchema = defineError(
  "CollectionHasNoRemote",
  v.object({ collectionId: CollectionIdSchema }),
);
export default CollectionHasNoRemoteSchema;
export type CollectionHasNoRemote = v.InferOutput<
  typeof CollectionHasNoRemoteSchema
>;

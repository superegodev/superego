import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";

const ReferencedCollectionsNotFoundSchema = defineError(
  "ReferencedCollectionsNotFound",
  v.object({
    /** The collection being created or updated. Null for new collections. */
    collectionId: v.nullable(CollectionIdSchema),
    /** Collection IDs referenced in the schema that do not exist. */
    notFoundCollectionIds: v.array(v.string()),
  }),
);
export default ReferencedCollectionsNotFoundSchema;
export type ReferencedCollectionsNotFound = v.InferOutput<
  typeof ReferencedCollectionsNotFoundSchema
>;

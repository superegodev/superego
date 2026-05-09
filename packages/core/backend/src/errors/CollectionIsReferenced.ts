import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";

const CollectionIsReferencedSchema = defineError(
  "CollectionIsReferenced",
  v.object({
    /** The collection that cannot be deleted. */
    collectionId: CollectionIdSchema,
    /** Collections whose schemas reference this collection via DocumentRef. */
    referencingCollectionIds: v.array(CollectionIdSchema),
  }),
);
export default CollectionIsReferencedSchema;
export type CollectionIsReferenced = v.InferOutput<
  typeof CollectionIsReferencedSchema
>;

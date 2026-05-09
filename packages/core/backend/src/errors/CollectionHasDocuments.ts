import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";

const CollectionHasDocumentsSchema = defineError(
  "CollectionHasDocuments",
  v.object({ collectionId: CollectionIdSchema }),
);
export default CollectionHasDocumentsSchema;
export type CollectionHasDocuments = v.InferOutput<
  typeof CollectionHasDocumentsSchema
>;

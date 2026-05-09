import * as v from "valibot";
import AppIdSchema from "../ids/AppId.js";
import CollectionCategoryIdSchema from "../ids/CollectionCategoryId.js";

const CollectionSettingsSchema = v.object({
  name: v.string(),
  icon: v.nullable(v.string()),
  collectionCategoryId: v.nullable(CollectionCategoryIdSchema),
  defaultCollectionViewAppId: v.nullable(AppIdSchema),
  description: v.nullable(v.string()),
  assistantInstructions: v.nullable(v.string()),
  redirectToCollectionAfterDocumentCreation: v.boolean(),
});
export default CollectionSettingsSchema;
export type CollectionSettings = v.InferOutput<typeof CollectionSettingsSchema>;

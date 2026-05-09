import { valibotSchemas as schemaValibotSchemas } from "@superego/schema";
import * as v from "valibot";
import AppIdSchema from "../ids/AppId.js";
import CollectionCategoryIdSchema from "../ids/CollectionCategoryId.js";
import ProtoAppIdSchema from "../ids/ProtoAppId.js";
import ProtoCollectionCategoryIdSchema from "../ids/ProtoCollectionCategoryId.js";
import CollectionVersionSettingsSchema from "./CollectionVersionSettings.js";

const CollectionDefinitionSchema = v.object({
  settings: v.object({
    name: v.string(),
    icon: v.nullable(v.string()),
    collectionCategoryId: v.nullable(CollectionCategoryIdSchema),
    defaultCollectionViewAppId: v.nullable(AppIdSchema),
    description: v.nullable(v.string()),
    assistantInstructions: v.nullable(v.string()),
    redirectToCollectionAfterDocumentCreation: v.boolean(),
  }),
  schema: schemaValibotSchemas.schema(),
  versionSettings: CollectionVersionSettingsSchema,
});
export default CollectionDefinitionSchema;
export type CollectionDefinition = v.InferOutput<
  typeof CollectionDefinitionSchema
>;

/**
 * Variant used inside Pack definitions, where settings.collectionCategoryId
 * may also be a ProtoCollectionCategoryId and settings.defaultCollectionViewAppId
 * may also be a ProtoAppId.
 */
export const PackCollectionDefinitionSchema = v.object({
  settings: v.object({
    name: v.string(),
    icon: v.nullable(v.string()),
    collectionCategoryId: v.nullable(
      v.union([ProtoCollectionCategoryIdSchema, CollectionCategoryIdSchema]),
    ),
    defaultCollectionViewAppId: v.nullable(
      v.union([ProtoAppIdSchema, AppIdSchema]),
    ),
    description: v.nullable(v.string()),
    assistantInstructions: v.nullable(v.string()),
    redirectToCollectionAfterDocumentCreation: v.boolean(),
  }),
  schema: schemaValibotSchemas.schema(),
  versionSettings: CollectionVersionSettingsSchema,
});
export type PackCollectionDefinition = v.InferOutput<
  typeof PackCollectionDefinitionSchema
>;

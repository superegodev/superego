import * as v from "valibot";
import CollectionIdSchema from "../ids/CollectionId.js";
import ProtoCollectionIdSchema from "../ids/ProtoCollectionId.js";

const DocumentDefinitionSchema = v.object({
  collectionId: CollectionIdSchema,
  content: v.any(),
  options: v.optional(v.object({ skipDuplicateCheck: v.boolean() })),
});
export default DocumentDefinitionSchema;
export type DocumentDefinition = v.InferOutput<typeof DocumentDefinitionSchema>;

/**
 * Variant used inside Pack definitions, where collectionId may also be a
 * ProtoCollectionId referencing a sibling pack entry.
 */
export const PackDocumentDefinitionSchema = v.object({
  collectionId: v.union([ProtoCollectionIdSchema, CollectionIdSchema]),
  content: v.any(),
  options: v.optional(v.object({ skipDuplicateCheck: v.boolean() })),
});
export type PackDocumentDefinition = v.InferOutput<
  typeof PackDocumentDefinitionSchema
>;

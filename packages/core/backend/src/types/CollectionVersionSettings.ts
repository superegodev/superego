import * as v from "valibot";
import DefaultDocumentViewUiOptionsSchema from "./DefaultDocumentViewUiOptions.js";
import TypescriptModuleSchema from "./TypescriptModule.js";

const CollectionVersionSettingsSchema = v.object({
  /**
   * A function that computes blocking keys for a document's content. Used to
   * detect duplicate documents. Documents that share any blocking key are
   * considered duplicates. Null if duplicate detection is disabled.
   */
  contentBlockingKeysGetter: v.nullable(TypescriptModuleSchema),
  contentSummaryGetter: TypescriptModuleSchema,
  defaultDocumentViewUiOptions: v.nullable(DefaultDocumentViewUiOptionsSchema),
});
export default CollectionVersionSettingsSchema;
export type CollectionVersionSettings = v.InferOutput<
  typeof CollectionVersionSettingsSchema
>;

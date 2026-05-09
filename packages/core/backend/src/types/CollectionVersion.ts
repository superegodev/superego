import { valibotSchemas as schemaValibotSchemas } from "@superego/schema";
import * as v from "valibot";
import CollectionVersionIdSchema from "../ids/CollectionVersionId.js";
import CollectionVersionSettingsSchema from "./CollectionVersionSettings.js";
import RemoteConvertersSchema from "./RemoteConverters.js";
import TypescriptModuleSchema from "./TypescriptModule.js";

const CollectionVersionSchema = v.object({
  id: CollectionVersionIdSchema,
  /** Id of the previous version. Null if this is the first version. */
  previousVersionId: v.nullable(CollectionVersionIdSchema),
  schema: schemaValibotSchemas.schema(),
  settings: CollectionVersionSettingsSchema,
  /**
   * The function that was run to migrate documents from the previous
   * version to this version. Null if this is the first version.
   */
  migration: v.nullable(TypescriptModuleSchema),
  remoteConverters: v.nullable(RemoteConvertersSchema),
  createdAt: v.date(),
});
export default CollectionVersionSchema;
export type CollectionVersion = v.InferOutput<typeof CollectionVersionSchema>;

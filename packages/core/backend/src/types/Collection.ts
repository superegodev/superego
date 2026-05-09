import * as v from "valibot";
import CollectionIdSchema from "../ids/CollectionId.js";
import CollectionSettingsSchema from "./CollectionSettings.js";
import CollectionVersionSchema from "./CollectionVersion.js";
import RemoteSchema from "./Remote.js";

const CollectionSchema = v.object({
  id: CollectionIdSchema,
  latestVersion: CollectionVersionSchema,
  settings: CollectionSettingsSchema,
  remote: v.nullable(RemoteSchema),
  createdAt: v.date(),
});
export default CollectionSchema;
export type Collection = v.InferOutput<typeof CollectionSchema>;

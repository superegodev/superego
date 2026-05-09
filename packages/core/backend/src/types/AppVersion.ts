import * as v from "valibot";
import AppVersionIdSchema from "../ids/AppVersionId.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import CollectionVersionIdSchema from "../ids/CollectionVersionId.js";
import TypescriptModuleSchema from "./TypescriptModule.js";

const AppVersionSchema = v.object({
  id: AppVersionIdSchema,
  targetCollections: v.array(
    v.object({
      id: CollectionIdSchema,
      versionId: CollectionVersionIdSchema,
    }),
  ),
  files: v.object({
    "/main.tsx": TypescriptModuleSchema,
  }),
  createdAt: v.date(),
});
export default AppVersionSchema;
export type AppVersion = v.InferOutput<typeof AppVersionSchema>;

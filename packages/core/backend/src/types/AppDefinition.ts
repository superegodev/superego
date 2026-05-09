import * as v from "valibot";
import { AppTypeSchema } from "../enums/AppType.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import ProtoCollectionIdSchema from "../ids/ProtoCollectionId.js";
import TypescriptModuleSchema from "./TypescriptModule.js";

const AppDefinitionSchema = v.object({
  type: AppTypeSchema,
  name: v.string(),
  targetCollectionIds: v.array(CollectionIdSchema),
  files: v.object({
    "/main.tsx": TypescriptModuleSchema,
  }),
});
export default AppDefinitionSchema;
export type AppDefinition = v.InferOutput<typeof AppDefinitionSchema>;

/**
 * Variant used inside Pack definitions, where targetCollectionIds may also
 * contain ProtoCollectionIds referencing sibling pack entries.
 */
export const PackAppDefinitionSchema = v.object({
  type: AppTypeSchema,
  name: v.string(),
  targetCollectionIds: v.array(
    v.union([ProtoCollectionIdSchema, CollectionIdSchema]),
  ),
  files: v.object({
    "/main.tsx": TypescriptModuleSchema,
  }),
});
export type PackAppDefinition = v.InferOutput<typeof PackAppDefinitionSchema>;

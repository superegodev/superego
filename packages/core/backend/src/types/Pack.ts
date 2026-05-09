import * as v from "valibot";
import PackIdSchema from "../ids/PackId.js";
import { PackAppDefinitionSchema } from "./AppDefinition.js";
import { PackCollectionCategoryDefinitionSchema } from "./CollectionCategoryDefinition.js";
import { PackCollectionDefinitionSchema } from "./CollectionDefinition.js";
import { PackDocumentDefinitionSchema } from "./DocumentDefinition.js";
import PackInfoSchema from "./PackInfo.js";

const PackSchema = v.object({
  id: PackIdSchema,
  info: PackInfoSchema,
  collectionCategories: v.array(PackCollectionCategoryDefinitionSchema),
  collections: v.array(PackCollectionDefinitionSchema),
  apps: v.array(PackAppDefinitionSchema),
  documents: v.array(PackDocumentDefinitionSchema),
});
export default PackSchema;
export type Pack = v.InferOutput<typeof PackSchema>;

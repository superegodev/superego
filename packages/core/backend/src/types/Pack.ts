import type PackId from "../ids/PackId.js";
import type AppDefinition from "./AppDefinition.js";
import type CollectionCategoryDefinition from "./CollectionCategoryDefinition.js";
import type CollectionDefinition from "./CollectionDefinition.js";
import type DocumentDefinition from "./DocumentDefinition.js";
import type PackInfo from "./PackInfo.js";

export default interface Pack {
  id: PackId;
  info: PackInfo;
  collectionCategories: CollectionCategoryDefinition<true>[];
  collections: CollectionDefinition<true, true>[];
  apps: AppDefinition<true>[];
  documents: DocumentDefinition<true>[];
}

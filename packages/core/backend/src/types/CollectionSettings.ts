import type AppId from "../ids/AppId.js";
import type CollectionCategoryId from "../ids/CollectionCategoryId.js";

export default interface CollectionSettings {
  name: string;
  icon: string | null;
  collectionCategoryId: CollectionCategoryId | null;
  defaultCollectionViewAppId: AppId | null;
  description: string | null;
  assistantInstructions: string | null;
}

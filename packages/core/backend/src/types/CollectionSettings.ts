import type CollectionCategoryId from "../ids/CollectionCategoryId.js";

export default interface CollectionSettings {
  name: string;
  icon: string | null;
  collectionCategoryId: CollectionCategoryId | null;
}

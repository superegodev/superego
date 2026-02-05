import type CollectionCategoryId from "../ids/CollectionCategoryId.js";
import type ProtoCollectionCategoryId from "../ids/ProtoCollectionCategoryId.js";

export default interface CollectionCategoryDefinition<
  IsPackDefinition extends boolean = false,
> {
  name: string;
  icon: string | null;
  parentId: IsPackDefinition extends true
    ? ProtoCollectionCategoryId | CollectionCategoryId | null
    : CollectionCategoryId | null;
}

import type CollectionCategoryId from "../ids/CollectionCategoryId.js";
import type ProtoCollectionCategoryId from "../ids/ProtoCollectionCategoryId.js";

export default interface CollectionCategoryDefinition<
  AllowProtoCollectionCategoryId extends boolean = false,
> {
  name: string;
  icon: string | null;
  parentId: AllowProtoCollectionCategoryId extends true
    ? ProtoCollectionCategoryId | CollectionCategoryId | null
    : CollectionCategoryId | null;
}

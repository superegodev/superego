import type CollectionId from "../ids/CollectionId.js";
import type ProtoCollectionId from "../ids/ProtoCollectionId.js";

export default interface DocumentDefinition<
  AllowProtoCollectionIds extends boolean = false,
> {
  collectionId: AllowProtoCollectionIds extends true
    ? ProtoCollectionId | CollectionId
    : CollectionId;
  content: any;
  options?: {
    skipDuplicateCheck: boolean;
  };
}

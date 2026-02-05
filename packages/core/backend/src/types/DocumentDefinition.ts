import type CollectionId from "../ids/CollectionId.js";
import type ProtoCollectionId from "../ids/ProtoCollectionId.js";

export default interface DocumentDefinition<
  IsPackDefinition extends boolean = false,
> {
  collectionId: IsPackDefinition extends true
    ? ProtoCollectionId | CollectionId
    : CollectionId;
  content: any;
  options?: {
    skipDuplicateCheck: boolean;
  };
}

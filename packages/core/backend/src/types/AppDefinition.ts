import type AppType from "../enums/AppType.js";
import type CollectionId from "../ids/CollectionId.js";
import type ProtoCollectionId from "../ids/ProtoCollectionId.js";
import type AppVersion from "./AppVersion.js";

export default interface AppDefinition<
  AllowProtoCollectionIds extends boolean = false,
> {
  type: AppType;
  name: string;
  targetCollectionIds: (AllowProtoCollectionIds extends true
    ? ProtoCollectionId | CollectionId
    : CollectionId)[];
  files: AppVersion["files"];
}

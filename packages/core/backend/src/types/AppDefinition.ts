import type AppType from "../enums/AppType.js";
import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";
import type ProtoCollectionId from "../ids/ProtoCollectionId.js";
import type AppVersion from "./AppVersion.js";

export default interface AppDefinition<
  AllowProtoCollectionIds extends boolean = false,
> {
  type: AppType;
  name: string;
  targetCollections: {
    id: AllowProtoCollectionIds extends true
      ? ProtoCollectionId | CollectionId
      : CollectionId;
    versionId: AllowProtoCollectionIds extends true
      ? CollectionVersionId | null
      : CollectionVersionId;
  }[];
  entrypoint: AppVersion["entrypoint"];
  files: AppVersion["files"];
}

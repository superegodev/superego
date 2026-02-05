import type AppType from "../enums/AppType.js";
import type ProtoAppId from "../ids/ProtoAppId.js";
import type ProtoCollectionId from "../ids/ProtoCollectionId.js";
import type AppVersion from "./AppVersion.js";

export default interface PackAppDefinition {
  protoId: ProtoAppId;
  type: AppType;
  name: string;
  targetCollectionProtoIds: ProtoCollectionId[];
  files: AppVersion["files"];
}

import type { Schema } from "@superego/schema";
import type ProtoAppId from "../ids/ProtoAppId.js";
import type ProtoCollectionId from "../ids/ProtoCollectionId.js";
import type CollectionVersionSettings from "./CollectionVersionSettings.js";

export default interface PackCollectionDefinition {
  protoId: ProtoCollectionId;
  settings: {
    name: string;
    icon: string | null;
    defaultCollectionViewAppProtoId: ProtoAppId | null;
    description: string | null;
    assistantInstructions: string | null;
  };
  schema: Schema;
  versionSettings: CollectionVersionSettings;
}

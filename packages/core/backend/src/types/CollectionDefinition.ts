import type { Schema } from "@superego/schema";
import type AppId from "../ids/AppId.js";
import type CollectionCategoryId from "../ids/CollectionCategoryId.js";
import type ProtoAppId from "../ids/ProtoAppId.js";
import type ProtoCollectionCategoryId from "../ids/ProtoCollectionCategoryId.js";
import type CollectionVersionSettings from "./CollectionVersionSettings.js";

export default interface CollectionDefinition<
  IsPackDefinition extends boolean = false,
> {
  settings: {
    name: string;
    icon: string | null;
    collectionCategoryId: IsPackDefinition extends true
      ? ProtoCollectionCategoryId | CollectionCategoryId | null
      : CollectionCategoryId | null;
    defaultCollectionViewAppId: IsPackDefinition extends true
      ? ProtoAppId | AppId | null
      : AppId | null;
    description: string | null;
    assistantInstructions: string | null;
  };
  schema: Schema;
  versionSettings: CollectionVersionSettings;
}

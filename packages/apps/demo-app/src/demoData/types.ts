import type {
  AppType,
  AppVersion,
  CollectionSettings,
  CollectionVersionSettings,
} from "@superego/backend";
import type { Schema } from "@superego/schema";

export type DemoCollectionCategory = {
  name: string;
  icon: string | null;
  parentId: null;
};

export type DemoCollection = {
  categoryName: string | null;
  settings: Pick<
    CollectionSettings,
    "name" | "icon" | "description" | "assistantInstructions"
  >;
  schema: Schema;
  versionSettings: CollectionVersionSettings;
  documents: unknown[];
  app?: {
    type: AppType;
    name: string;
    files: AppVersion["files"];
  };
};

export type DemoData = {
  collectionCategories: DemoCollectionCategory[];
  collections: DemoCollection[];
};

import type { AppPermissions } from "@superego/backend";
import {
  AppType,
  type CollectionId,
  type CollectionVersion,
} from "@superego/backend";

export interface AppManifest {
  name: string;
  permissions?: AppPermissions | undefined;
  state?:
    | {
        schema: "state.schema.json";
        initialState: "state.initial.json";
        migration?: "state.migration.ts" | undefined;
      }
    | undefined;
  type: AppType.CollectionView;
  targetCollectionIds: CollectionId[];
}

export interface AppLock {
  appId: string;
  latestAppVersionId: string;
  targetCollections: {
    id: CollectionId;
    versionId: string;
  }[];
}

export interface TargetCollection {
  id: CollectionId;
  version: CollectionVersion;
  displayName: string;
}

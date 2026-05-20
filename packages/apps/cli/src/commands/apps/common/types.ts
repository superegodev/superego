import {
  AppType,
  type CollectionId,
  type CollectionVersion,
} from "@superego/backend";

export interface AppManifest {
  name: string;
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

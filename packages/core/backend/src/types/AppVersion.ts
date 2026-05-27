import type AppVersionId from "../ids/AppVersionId.js";
import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";

export default interface AppVersion {
  id: AppVersionId;
  targetCollections: {
    id: CollectionId;
    versionId: CollectionVersionId;
  }[];
  files: {
    "/main.tsx": string;
    "/main.js": string;
  };
  createdAt: Date;
}

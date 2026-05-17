import type AppVersionId from "../ids/AppVersionId.js";
import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";
import type AppVersionFile from "./AppVersionFile.js";

export default interface AppVersion {
  id: AppVersionId;
  targetCollections: {
    id: CollectionId;
    versionId: CollectionVersionId;
  }[];
  entrypoint: "/dist/index.html";
  files: Record<`/${string}`, AppVersionFile>;
  createdAt: Date;
}

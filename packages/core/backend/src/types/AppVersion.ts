import type AppVersionId from "../ids/AppVersionId.js";
import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";
import type AppStateDefinition from "./AppStateDefinition.js";
import type TypescriptModule from "./TypescriptModule.js";

export default interface AppVersion {
  id: AppVersionId;
  targetCollections: {
    id: CollectionId;
    versionId: CollectionVersionId;
  }[];
  files: {
    "/main.tsx": TypescriptModule;
  };
  createdAt: Date;
  stateDefinition: AppStateDefinition;
}

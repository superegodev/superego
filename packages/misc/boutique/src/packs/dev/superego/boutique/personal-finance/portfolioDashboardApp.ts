import { type AppDefinition, AppType } from "@superego/backend";
import makeAppFiles from "../makeAppFiles.js";
import portfolioDashboardAppCompiled from "./portfolioDashboard.appCompiled.js?raw";
import portfolioDashboardAppSource from "./portfolioDashboard.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Portfolio Dashboard",
  targetCollections: [
    { id: "ProtoCollection_1", versionId: null },
    { id: "ProtoCollection_2", versionId: null },
    { id: "ProtoCollection_3", versionId: null },
  ],
  entrypoint: "/dist/index.html",
  files: makeAppFiles(
    portfolioDashboardAppSource,
    portfolioDashboardAppCompiled,
  ),
} as const satisfies AppDefinition<true>;

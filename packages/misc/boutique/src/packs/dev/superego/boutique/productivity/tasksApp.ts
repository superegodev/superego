import { type AppDefinition, AppType } from "@superego/backend";
import makeAppFiles from "../makeAppFiles.js";
import tasksAppCompiled from "./tasks.appCompiled.js?raw";
import tasksAppSource from "./tasks.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Kanban Board",
  targetCollections: [{ id: "ProtoCollection_2", versionId: null }],
  entrypoint: "/dist/index.html",
  files: makeAppFiles(tasksAppSource, tasksAppCompiled),
} as const satisfies AppDefinition<true>;

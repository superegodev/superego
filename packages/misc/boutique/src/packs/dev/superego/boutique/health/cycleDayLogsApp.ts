import { type AppDefinition, AppType } from "@superego/backend";
import makeAppFiles from "../makeAppFiles.js";
import cycleDayLogsAppCompiled from "./cycleDayLogs.appCompiled.js?raw";
import cycleDayLogsAppSource from "./cycleDayLogs.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Cycle Calendar",
  targetCollections: [{ id: "ProtoCollection_0", versionId: null }],
  entrypoint: "/dist/index.html",
  files: makeAppFiles(cycleDayLogsAppSource, cycleDayLogsAppCompiled),
} as const satisfies AppDefinition<true>;

import { type AppDefinition, AppType } from "@superego/backend";
import makeAppFiles from "../makeAppFiles.js";
import fuelLogsAppCompiled from "./fuelLogs.appCompiled.js?raw";
import fuelLogsAppSource from "./fuelLogs.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Fuel Stats",
  targetCollections: [{ id: "ProtoCollection_0", versionId: null }],
  entrypoint: "/dist/index.html",
  files: makeAppFiles(fuelLogsAppSource, fuelLogsAppCompiled),
} as const satisfies AppDefinition<true>;

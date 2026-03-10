import { type AppDefinition, AppType } from "@superego/backend";
import cycleDayLogsAppCompiled from "./cycleDayLogs.appCompiled.js?raw";
import cycleDayLogsAppSource from "./cycleDayLogs.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Cycle Calendar",
  targetCollectionIds: ["ProtoCollection_0"],
  files: {
    "/main.tsx": {
      source: cycleDayLogsAppSource,
      compiled: cycleDayLogsAppCompiled,
    },
  },
} as const satisfies AppDefinition<true>;

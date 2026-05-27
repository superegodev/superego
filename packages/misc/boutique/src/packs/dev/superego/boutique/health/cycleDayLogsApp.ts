import { type AppDefinition, AppType } from "@superego/backend";
import cycleDayLogsAppSource from "./cycleDayLogs.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Cycle Calendar",
  targetCollectionIds: ["ProtoCollection_0"],
  files: {
    "/main.tsx": cycleDayLogsAppSource,
  },
} as const satisfies AppDefinition<true>;

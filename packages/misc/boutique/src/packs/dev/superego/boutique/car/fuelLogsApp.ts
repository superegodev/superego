import { type AppDefinition, AppType } from "@superego/backend";
import { emptyAppStateDefinition } from "@superego/shared-utils";
import fuelLogsAppCompiled from "./fuelLogs.appCompiled.js?raw";
import fuelLogsAppSource from "./fuelLogs.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  state: emptyAppStateDefinition,
  name: "Fuel Stats",
  targetCollectionIds: ["ProtoCollection_0"],
  files: {
    "/main.tsx": {
      source: fuelLogsAppSource,
      compiled: fuelLogsAppCompiled,
    },
  },
} as const satisfies AppDefinition<true>;

import { type AppDefinition, AppType } from "@superego/backend";
import fuelLogsAppCompiled from "./fuelLogs.appCompiled.js?raw";
import fuelLogsAppSource from "./fuelLogs.appSource.tsx?raw";

const fuelLogsApp: AppDefinition<true> = {
  type: AppType.CollectionView,
  name: "Fuel Stats",
  targetCollectionIds: ["ProtoCollection_3"],
  files: {
    "/main.tsx": {
      source: fuelLogsAppSource,
      compiled: fuelLogsAppCompiled,
    },
  },
};

export default fuelLogsApp;

import { type AppDefinition, AppType } from "@superego/backend";
import fuelLogsAppSource from "./fuelLogs.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Fuel Stats",
  targetCollectionIds: ["ProtoCollection_0"],
  files: {
    "/main.tsx": fuelLogsAppSource,
  },
} as const satisfies AppDefinition<true>;

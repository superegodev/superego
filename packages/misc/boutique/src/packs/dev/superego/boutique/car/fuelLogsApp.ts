import { type AppDefinition, AppType } from "@superego/backend";
import { defaultAppPermissions } from "@superego/shared-utils";
import { emptyAppStateDefinition } from "@superego/shared-utils";
import fuelLogsAppCompiled from "./fuelLogs.appCompiled.js?raw";
import fuelLogsAppSource from "./fuelLogs.appSource.tsx?raw";

export default {
  permissions: defaultAppPermissions,
  type: AppType.CollectionView,
  stateDefinition: emptyAppStateDefinition,
  name: "Fuel Stats",
  targetCollectionIds: ["ProtoCollection_0"],
  files: {
    "/main.tsx": {
      source: fuelLogsAppSource,
      compiled: fuelLogsAppCompiled,
    },
  },
} as const satisfies AppDefinition<true>;

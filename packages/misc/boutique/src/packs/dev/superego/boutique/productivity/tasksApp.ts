import { type AppDefinition, AppType } from "@superego/backend";
import { defaultAppPermissions } from "@superego/shared-utils";
import { emptyAppStateDefinition } from "@superego/shared-utils";
import tasksAppCompiled from "./tasks.appCompiled.js?raw";
import tasksAppSource from "./tasks.appSource.tsx?raw";

export default {
  permissions: defaultAppPermissions,
  type: AppType.CollectionView,
  stateDefinition: emptyAppStateDefinition,
  name: "Kanban Board",
  targetCollectionIds: ["ProtoCollection_2"],
  files: {
    "/main.tsx": {
      source: tasksAppSource,
      compiled: tasksAppCompiled,
    },
  },
} as const satisfies AppDefinition<true>;

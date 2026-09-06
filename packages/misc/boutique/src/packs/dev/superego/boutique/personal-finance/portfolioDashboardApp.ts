import { type AppDefinition, AppType } from "@superego/backend";
import { defaultAppPermissions } from "@superego/shared-utils";
import { emptyAppStateDefinition } from "@superego/shared-utils";
import portfolioDashboardAppCompiled from "./portfolioDashboard.appCompiled.js?raw";
import portfolioDashboardAppSource from "./portfolioDashboard.appSource.tsx?raw";

export default {
  permissions: defaultAppPermissions,
  type: AppType.CollectionView,
  state: emptyAppStateDefinition,
  name: "Portfolio Dashboard",
  targetCollectionIds: [
    "ProtoCollection_1",
    "ProtoCollection_2",
    "ProtoCollection_3",
  ],
  files: {
    "/main.tsx": {
      source: portfolioDashboardAppSource,
      compiled: portfolioDashboardAppCompiled,
    },
  },
} as const satisfies AppDefinition<true>;

import { type AppDefinition, AppType } from "@superego/backend";
import portfolioDashboardAppSource from "./portfolioDashboard.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Portfolio Dashboard",
  targetCollectionIds: [
    "ProtoCollection_1",
    "ProtoCollection_2",
    "ProtoCollection_3",
  ],
  files: {
    "/main.tsx": portfolioDashboardAppSource,
  },
} as const satisfies AppDefinition<true>;

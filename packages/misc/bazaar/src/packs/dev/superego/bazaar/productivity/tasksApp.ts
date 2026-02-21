import { type AppDefinition, AppType } from "@superego/backend";
import tasksAppCompiled from "./tasks.appCompiled.js?raw";
import tasksAppSource from "./tasks.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Kanban Board",
  targetCollectionIds: ["ProtoCollection_2"],
  files: {
    "/main.tsx": {
      source: tasksAppSource,
      compiled: tasksAppCompiled,
    },
  },
} as const satisfies AppDefinition<true>;

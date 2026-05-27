import { type AppDefinition, AppType } from "@superego/backend";
import tasksAppSource from "./tasks.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Kanban Board",
  targetCollectionIds: ["ProtoCollection_2"],
  files: {
    "/main.tsx": tasksAppSource,
  },
} as const satisfies AppDefinition<true>;

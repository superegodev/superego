import { type AppDefinition, AppType } from "@superego/backend";
import calendarAppSource from "./calendar.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Calendar",
  targetCollectionIds: ["ProtoCollection_1"],
  files: {
    "/main.tsx": calendarAppSource,
  },
} as const satisfies AppDefinition<true>;

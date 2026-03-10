import { type AppDefinition, AppType } from "@superego/backend";
import calendarAppCompiled from "./calendar.appCompiled.js?raw";
import calendarAppSource from "./calendar.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Calendar",
  targetCollectionIds: ["ProtoCollection_1"],
  files: {
    "/main.tsx": {
      source: calendarAppSource,
      compiled: calendarAppCompiled,
    },
  },
} as const satisfies AppDefinition<true>;

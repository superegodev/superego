import { type AppDefinition, AppType } from "@superego/backend";
import { emptyAppStateDefinition } from "@superego/shared-utils";
import calendarAppCompiled from "./calendar.appCompiled.js?raw";
import calendarAppSource from "./calendar.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  state: emptyAppStateDefinition,
  name: "Calendar",
  targetCollectionIds: ["ProtoCollection_1"],
  files: {
    "/main.tsx": {
      source: calendarAppSource,
      compiled: calendarAppCompiled,
    },
  },
} as const satisfies AppDefinition<true>;

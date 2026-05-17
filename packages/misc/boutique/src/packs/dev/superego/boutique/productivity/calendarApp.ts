import { type AppDefinition, AppType } from "@superego/backend";
import makeAppFiles from "../makeAppFiles.js";
import calendarAppCompiled from "./calendar.appCompiled.js?raw";
import calendarAppSource from "./calendar.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Calendar",
  targetCollections: [{ id: "ProtoCollection_1", versionId: null }],
  entrypoint: "/dist/index.html",
  files: makeAppFiles(calendarAppSource, calendarAppCompiled),
} as const satisfies AppDefinition<true>;

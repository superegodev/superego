import { type AppDefinition, AppType } from "@superego/backend";
import makeAppFiles from "../makeAppFiles.js";
import expensesAppCompiled from "./expenses.appCompiled.js?raw";
import expensesAppSource from "./expenses.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Expense Stats",
  targetCollections: [{ id: "ProtoCollection_0", versionId: null }],
  entrypoint: "/dist/index.html",
  files: makeAppFiles(expensesAppSource, expensesAppCompiled),
} as const satisfies AppDefinition<true>;

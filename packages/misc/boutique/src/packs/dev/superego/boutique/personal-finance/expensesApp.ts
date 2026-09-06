import { type AppDefinition, AppType } from "@superego/backend";
import { emptyAppStateDefinition } from "@superego/shared-utils";
import expensesAppCompiled from "./expenses.appCompiled.js?raw";
import expensesAppSource from "./expenses.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  state: emptyAppStateDefinition,
  name: "Expense Stats",
  targetCollectionIds: ["ProtoCollection_0"],
  files: {
    "/main.tsx": {
      source: expensesAppSource,
      compiled: expensesAppCompiled,
    },
  },
} as const satisfies AppDefinition<true>;

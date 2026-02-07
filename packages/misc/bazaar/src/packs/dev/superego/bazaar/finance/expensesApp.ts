import { type AppDefinition, AppType } from "@superego/backend";
import expensesAppCompiled from "./expenses.appCompiled.js?raw";
import expensesAppSource from "./expenses.appSource.tsx?raw";

const expensesApp: AppDefinition<true> = {
  type: AppType.CollectionView,
  name: "Expense Stats",
  targetCollectionIds: ["ProtoCollection_2"],
  files: {
    "/main.tsx": {
      source: expensesAppSource,
      compiled: expensesAppCompiled,
    },
  },
};
export default expensesApp;

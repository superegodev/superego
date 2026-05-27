import { type AppDefinition, AppType } from "@superego/backend";
import expensesAppSource from "./expenses.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Expense Stats",
  targetCollectionIds: ["ProtoCollection_0"],
  files: {
    "/main.tsx": expensesAppSource,
  },
} as const satisfies AppDefinition<true>;

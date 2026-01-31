import { AppType } from "@superego/backend";
import expensesAppCompiled from "./expenses.appCompiled.js?raw";
import expensesAppSource from "./expenses.appSource.tsx?raw";
import expensesData from "./expensesData.js";
import expensesSchema from "./expensesSchema.js";
import type { DemoCollection } from "./types.js";

export default {
  categoryName: "Finance",
  settings: {
    name: "Expenses",
    icon: "💸",
    description: null,
    assistantInstructions: [
      "- Defaults for things I don't specify:",
      "  - Currency -> EUR.",
      "  - Payment method -> Credit Card.",
    ].join("\n"),
  },
  schema: expensesSchema,
  versionSettings: {
    contentBlockingKeysGetter: null,
    contentSummaryGetter: {
      source: `
import type { Expense } from "./CollectionSchema.js";

export default function getContentSummary(
  expense: Expense
): Record<string, string | number | boolean | null> {
  return {
    "{position:0,sortable:true} Title": expense.title,
    "{position:1,sortable:true,default-sort:desc} Date": expense.date,
    "{position:2,sortable:true} Amount": expense.amount,
    "{position:3,sortable:true} Currency": expense.currency,
    "{position:4,sortable:true} Category": expense.category,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(expense) {
  return {
    "{position:0,sortable:true} Title": expense.title,
    "{position:1,sortable:true,default-sort:desc} Date": expense.date,
    "{position:2,sortable:true} Amount": expense.amount,
    "{position:3,sortable:true} Currency": expense.currency,
    "{position:4,sortable:true} Category": expense.category,
  };
}
      `.trim(),
    },
  },
  documents: expensesData,
  app: {
    type: AppType.CollectionView,
    name: "Expense Stats",
    files: {
      "/main.tsx": {
        source: expensesAppSource,
        compiled: expensesAppCompiled,
      },
    },
  },
} satisfies DemoCollection;

import type { CollectionDefinition } from "@superego/backend";
import expensesSchema from "./expensesSchema.js";

export default {
  settings: {
    name: "Expenses",
    icon: "💸",
    description: null,
    assistantInstructions: [
      "- Defaults if not specified:",
      "  - Currency -> EUR.",
      "  - Payment method -> Credit Card.",
    ].join("\n"),
    redirectToCollectionAfterDocumentCreation: false,
    collectionCategoryId: "ProtoCollectionCategory_0",
    defaultCollectionViewAppId: "ProtoApp_0",
  },
  schema: expensesSchema,
  versionSettings: {
    contentBlockingKeysGetter: null,
    contentSummaryGetter: `
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
    defaultDocumentViewUiOptions: null,
  },
} as const satisfies CollectionDefinition<true, true>;

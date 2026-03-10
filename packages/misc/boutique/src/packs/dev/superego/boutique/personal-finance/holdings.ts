import type { CollectionDefinition } from "@superego/backend";
import holdingsSchema from "./holdingsSchema.js";

export default {
  settings: {
    name: "Holdings",
    icon: "🏦",
    description: "Security holdings with buy/sell transaction histories",
    assistantInstructions: null,
    collectionCategoryId: "ProtoCollectionCategory_1",
    defaultCollectionViewAppId: "ProtoApp_1",
  },
  schema: holdingsSchema,
  versionSettings: {
    contentBlockingKeysGetter: {
      source: `
import type { Holding } from "./CollectionSchema.js";

export default function getContentBlockingKeys(holding: Holding): string[] {
  return [
    \`security:\${holding.security.documentId}:account:\${holding.account.documentId}\`,
  ];
}
      `.trim(),
      compiled: `
export default function getContentBlockingKeys(holding) {
  return [
    \`security:\${holding.security.documentId}:account:\${holding.account.documentId}\`,
  ];
}
      `.trim(),
    },
    contentSummaryGetter: {
      source: `
import type { Holding } from "./CollectionSchema.js";

export default function getContentSummary(
  holding: Holding
): Record<string, string | number | boolean | null> {
  const netQuantity = holding.transactions.reduce((sum, tx) => {
    return tx.type === "Buy" ? sum + tx.quantity : sum - tx.quantity;
  }, 0);
  const totalInvested = holding.transactions
    .filter((tx) => tx.type === "Buy")
    .reduce((sum, tx) => sum + tx.quantity * tx.pricePerUnit, 0);
  return {
    "{position:0,sortable:true,default-sort:desc} Transactions":
      holding.transactions.length,
    "{position:1,sortable:true} Net Quantity":
      Math.round(netQuantity * 100) / 100,
    "{position:2,sortable:true} Total Invested":
      Math.round(totalInvested * 100) / 100,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(holding) {
  const netQuantity = holding.transactions.reduce((sum, tx) => {
    return tx.type === "Buy" ? sum + tx.quantity : sum - tx.quantity;
  }, 0);
  const totalInvested = holding.transactions
    .filter((tx) => tx.type === "Buy")
    .reduce((sum, tx) => sum + tx.quantity * tx.pricePerUnit, 0);
  return {
    "{position:0,sortable:true,default-sort:desc} Transactions":
      holding.transactions.length,
    "{position:1,sortable:true} Net Quantity":
      Math.round(netQuantity * 100) / 100,
    "{position:2,sortable:true} Total Invested":
      Math.round(totalInvested * 100) / 100,
  };
}
      `.trim(),
    },
    defaultDocumentViewUiOptions: null,
  },
} as const satisfies CollectionDefinition<true, true>;

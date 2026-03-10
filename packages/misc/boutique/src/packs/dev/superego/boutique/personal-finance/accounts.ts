import type { CollectionDefinition } from "@superego/backend";
import accountsSchema from "./accountsSchema.js";

export default {
  settings: {
    name: "Accounts",
    icon: "🔑",
    description: "Brokerage and exchange accounts",
    assistantInstructions: null,
    collectionCategoryId: "ProtoCollectionCategory_1",
    defaultCollectionViewAppId: null,
  },
  schema: accountsSchema,
  versionSettings: {
    contentBlockingKeysGetter: {
      source: `
import type { Account } from "./CollectionSchema.js";

export default function getContentBlockingKeys(account: Account): string[] {
  return [
    \`name:\${account.name.trim().toLowerCase()}:broker:\${account.broker.trim().toLowerCase()}\`,
  ];
}
      `.trim(),
      compiled: `
export default function getContentBlockingKeys(account) {
  return [
    \`name:\${account.name.trim().toLowerCase()}:broker:\${account.broker.trim().toLowerCase()}\`,
  ];
}
      `.trim(),
    },
    contentSummaryGetter: {
      source: `
import type { Account } from "./CollectionSchema.js";

export default function getContentSummary(
  account: Account
): Record<string, string | number | boolean | null> {
  return {
    "{position:0,sortable:true,default-sort:asc} Name": account.name,
    "{position:1,sortable:true} Broker": account.broker,
    "{position:2} Currency": account.currency,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(account) {
  return {
    "{position:0,sortable:true,default-sort:asc} Name": account.name,
    "{position:1,sortable:true} Broker": account.broker,
    "{position:2} Currency": account.currency,
  };
}
      `.trim(),
    },
    defaultDocumentViewUiOptions: null,
  },
} as const satisfies CollectionDefinition<true, true>;

import type { CollectionDefinition } from "@superego/backend";
import securitiesSchema from "./securitiesSchema.js";

export default {
  settings: {
    name: "Securities",
    icon: "📈",
    description: "Catalogue of securities: stocks, ETFs, bonds, and crypto",
    assistantInstructions: null,
    redirectToCollectionAfterDocumentCreation: false,
    collectionCategoryId: "ProtoCollectionCategory_1",
    defaultCollectionViewAppId: null,
  },
  schema: securitiesSchema,
  versionSettings: {
    contentBlockingKeysGetter: `
import type { Security } from "./CollectionSchema.js";

export default function getContentBlockingKeys(security: Security): string[] {
  const keys: string[] = [];
  keys.push(\`ticker:\${security.ticker.trim().toLowerCase()}:\${security.currency.trim().toLowerCase()}:\${(security.exchange ?? "").trim().toLowerCase()}\`);
  if (security.isin !== null) {
    keys.push(\`isin:\${security.isin.trim().toLowerCase()}\`);
  }
  return keys;
}
      `.trim(),
    contentSummaryGetter: `
import type { Security } from "./CollectionSchema.js";

export default function getContentSummary(
  security: Security
): Record<string, string | number | boolean | null> {
  const latestPriceEntry = security.priceHistory
    .slice()
    .sort((a, b) => a.instant.localeCompare(b.instant))
    .at(-1);
  return {
    "{position:0,sortable:true,default-sort:asc} Ticker": security.ticker,
    "{position:1,sortable:true} Name": security.name,
    "{position:2,sortable:true} Type": security.type,
    "{position:3} Currency": security.currency,
    "{position:4,sortable:true} Latest Price":
      latestPriceEntry ? Math.round(latestPriceEntry.price * 100) / 100 : null,
  };
}
      `.trim(),
    defaultDocumentViewUiOptions: null,
  },
} as const satisfies CollectionDefinition<true, true>;

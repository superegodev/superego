import type { CollectionDefinition } from "@superego/backend";
import securitiesSchema from "./securitiesSchema.js";

export default {
  settings: {
    name: "Securities",
    icon: "📈",
    description: "Catalogue of securities: stocks, ETFs, bonds, and crypto",
    assistantInstructions: null,
    collectionCategoryId: "ProtoCollectionCategory_1",
    defaultCollectionViewAppId: null,
  },
  schema: securitiesSchema,
  versionSettings: {
    contentBlockingKeysGetter: {
      source: `
import type { Security } from "./CollectionSchema.js";

export default function getContentBlockingKeys(security: Security): string[] {
  const keys: string[] = [];
  keys.push(\`ticker:\${security.ticker.trim().toLowerCase()}\`);
  if (security.isin !== null) {
    keys.push(\`isin:\${security.isin.trim().toLowerCase()}\`);
  }
  return keys;
}
      `.trim(),
      compiled: `
export default function getContentBlockingKeys(security) {
  const keys = [];
  keys.push(\`ticker:\${security.ticker.trim().toLowerCase()}\`);
  if (security.isin !== null) {
    keys.push(\`isin:\${security.isin.trim().toLowerCase()}\`);
  }
  return keys;
}
      `.trim(),
    },
    contentSummaryGetter: {
      source: `
import type { Security } from "./CollectionSchema.js";

export default function getContentSummary(
  security: Security
): Record<string, string | number | boolean | null> {
  const latestPrice =
    security.priceHistory.length > 0
      ? security.priceHistory
          .slice()
          .sort((a, b) => a.instant.localeCompare(b.instant))
          .at(-1).price
      : null;
  return {
    "{position:0,sortable:true,default-sort:asc} Ticker": security.ticker,
    "{position:1,sortable:true} Name": security.name,
    "{position:2,sortable:true} Type": security.type,
    "{position:3} Currency": security.currency,
    "{position:4,sortable:true} Latest Price":
      latestPrice !== null ? Math.round(latestPrice * 100) / 100 : null,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(security) {
  const latestPrice =
    security.priceHistory.length > 0
      ? security.priceHistory
          .slice()
          .sort((a, b) => a.instant.localeCompare(b.instant))
          .at(-1).price
      : null;
  return {
    "{position:0,sortable:true,default-sort:asc} Ticker": security.ticker,
    "{position:1,sortable:true} Name": security.name,
    "{position:2,sortable:true} Type": security.type,
    "{position:3} Currency": security.currency,
    "{position:4,sortable:true} Latest Price":
      latestPrice !== null ? Math.round(latestPrice * 100) / 100 : null,
  };
}
      `.trim(),
    },
    defaultDocumentViewUiOptions: null,
  },
} as const satisfies CollectionDefinition<true, true>;

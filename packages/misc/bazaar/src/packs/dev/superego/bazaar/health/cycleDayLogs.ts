import type { CollectionDefinition } from "@superego/backend";
import cycleDayLogsSchema from "./cycleDayLogsSchema.js";

export default {
  settings: {
    name: "Cycle Logs",
    icon: "🩸",
    description: null,
    assistantInstructions: [
      "- Keep exactly one log per date.",
      "- Keep symptoms concise and practical.",
    ].join("\n"),
    collectionCategoryId: "ProtoCollectionCategory_0",
    defaultCollectionViewAppId: "ProtoApp_0",
  },
  schema: cycleDayLogsSchema,
  versionSettings: {
    contentBlockingKeysGetter: {
      source: `
import type { CycleDayLog } from "./CollectionSchema.js";

export default function getContentBlockingKeys(
  cycleDayLog: CycleDayLog,
): string[] {
  return [\`date:\${cycleDayLog.date}\`];
}
      `.trim(),
      compiled: `
export default function getContentBlockingKeys(cycleDayLog) {
  return [\`date:\${cycleDayLog.date}\`];
}
      `.trim(),
    },
    contentSummaryGetter: {
      source: `
import type { CycleDayLog } from "./CollectionSchema.js";

export default function getContentSummary(
  cycleDayLog: CycleDayLog,
): Record<string, string | number | boolean | null> {
  return {
    "{position:0,sortable:true,default-sort:desc} Date": cycleDayLog.date,
    "{position:1,sortable:true} Flow": cycleDayLog.flow,
    "{position:2,sortable:true} Symptoms":
      cycleDayLog.symptoms?.join(", ") ?? null,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(cycleDayLog) {
  return {
    "{position:0,sortable:true,default-sort:desc} Date": cycleDayLog.date,
    "{position:1,sortable:true} Flow": cycleDayLog.flow,
    "{position:2,sortable:true} Symptoms":
      cycleDayLog.symptoms?.join(", ") ?? null,
  };
}
      `.trim(),
    },
    defaultDocumentViewUiOptions: null,
  },
} as const satisfies CollectionDefinition<true, true>;

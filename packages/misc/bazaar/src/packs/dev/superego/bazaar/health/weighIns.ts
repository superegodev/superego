import type { CollectionDefinition } from "@superego/backend";
import weighInsSchema from "./weighInsSchema.js";

export default {
  settings: {
    name: "Weigh-ins",
    icon: "⚖️",
    description: null,
    assistantInstructions: [
      "- Defaults for things I don't specify:",
      "  - Scale -> Garmin Index S2.",
    ].join("\n"),
    collectionCategoryId: "ProtoCollectionCategory_0",
    defaultCollectionViewAppId: null,
  },
  schema: weighInsSchema,
  versionSettings: {
    defaultDocumentLayoutOptions: null,
    contentBlockingKeysGetter: null,
    contentSummaryGetter: {
      source: `
import type { WeighIn } from "./CollectionSchema.js";

export default function getContentSummary(
  weighIn: WeighIn,
): Record<string, string | number | boolean | null> {
  return {
    "{position:0,sortable:true,default-sort:desc} Date": weighIn.timestamp,
    "{position:1,sortable:true} Weight (kg)": weighIn.weightKg,
    "{position:2,sortable:true} Scale": weighIn.scale,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(weighIn) {
  return {
    "{position:0,sortable:true,default-sort:desc} Date": weighIn.timestamp,
    "{position:1,sortable:true} Weight (kg)": weighIn.weightKg,
    "{position:2,sortable:true} Scale": weighIn.scale,
  };
}
      `.trim(),
    },
  },
} as const satisfies CollectionDefinition<true, true>;

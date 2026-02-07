import type { CollectionDefinition } from "@superego/backend";
import weighInsSchema from "./weighInsSchema.js";

const weighIns: CollectionDefinition<true, true> = {
  settings: {
    name: "Weigh-ins",
    icon: "⚖️",
    description: null,
    assistantInstructions: [
      "- Defaults for things I don't specify:",
      "  - Scale -> Garmin Index S2.",
    ].join("\n"),
    collectionCategoryId: "ProtoCollectionCategory_2",
    defaultCollectionViewAppId: null,
  },
  schema: weighInsSchema,
  versionSettings: {
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
};

export default weighIns;

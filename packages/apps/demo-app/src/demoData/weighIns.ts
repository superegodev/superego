import type { DemoCollection } from "./types.js";
import weighInsData from "./weighInsData.js";
import weighInsSchema from "./weighInsSchema.js";

export default {
  categoryName: "Health",
  settings: {
    name: "Weigh-ins",
    icon: "⚖️",
    description: null,
    assistantInstructions: [
      "- Defaults for things I don't specify:",
      "  - Scale -> Garmin Index S2.",
    ].join("\n"),
  },
  schema: weighInsSchema,
  versionSettings: {
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
    contentFingerprintGetter: null,
  },
  documents: weighInsData,
} satisfies DemoCollection;

import type { CollectionDefinition } from "@superego/backend";
import fuelLogsSchema from "./fuelLogsSchema.js";

export default {
  settings: {
    name: "Fuel Logs",
    icon: "⛽",
    description: null,
    assistantInstructions: [
      '- Use reasonable values for liters and total cost. E.g., if I say I put "5304" liters, or "5,3,0,4 liters", I probably mean 53.04, even if I didn\'t specify the decimal or just gave a list of numbers.',
      "- Default to full tank if I don't specify it.",
      "- Always ask for the odometer reading.",
    ].join("\n"),
    collectionCategoryId: "ProtoCollectionCategory_0",
    defaultCollectionViewAppId: "ProtoApp_0",
  },
  schema: fuelLogsSchema,
  versionSettings: {
    contentBlockingKeysGetter: {
      source: `
import type { FuelLog } from "./CollectionSchema.js";

export default function getContentBlockingKeys(fuelLog: FuelLog): string[] {
  return [
    [
      \`odometer:\${fuelLog.odometer}\`,
      \`liters:\${fuelLog.liters}\`,
      \`cost:\${fuelLog.totalCost}\`
    ].join(",")
  ];
}
      `.trim(),
      compiled: `
export default function getContentBlockingKeys(fuelLog) {
  return [
    [
      \`odometer:\${fuelLog.odometer}\`,
      \`liters:\${fuelLog.liters}\`,
      \`cost:\${fuelLog.totalCost}\`
    ].join(",")
  ];
}
      `.trim(),
    },
    contentSummaryGetter: {
      source: `
import type { FuelLog } from "./CollectionSchema.js";

export default function getContentSummary(
  fuelLog: FuelLog
): Record<string, string | number | boolean | null> {
  return {
    "{position:0,sortable:true,default-sort:desc} Date": fuelLog.timestamp,
    "{position:1,sortable:true} Liters": fuelLog.liters,
    "{position:2,sortable:true} Total Cost (€)": fuelLog.totalCost,
    "{position:3,sortable:true} Price":
      Math.round((fuelLog.totalCost / fuelLog.liters) * 1_000) / 1_000,
    "{position:4,sortable:true} Odometer (km)": fuelLog.odometer,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(fuelLog) {
  return {
    "{position:0,sortable:true,default-sort:desc} Date": fuelLog.timestamp,
    "{position:1,sortable:true} Liters": fuelLog.liters,
    "{position:2,sortable:true} Total Cost (€)": fuelLog.totalCost,
    "{position:3,sortable:true} Price":
      Math.round((fuelLog.totalCost / fuelLog.liters) * 1_000) / 1_000,
    "{position:4,sortable:true} Odometer (km)": fuelLog.odometer,
  };
}
      `.trim(),
    },
  },
} as const satisfies CollectionDefinition<true, true>;

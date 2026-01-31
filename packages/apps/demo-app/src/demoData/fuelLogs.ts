import { AppType } from "@superego/backend";
import fuelLogsAppCompiled from "./fuelLogs.appCompiled.js?raw";
import fuelLogsAppSource from "./fuelLogs.appSource.tsx?raw";
import fuelLogsData from "./fuelLogsData.js";
import fuelLogsSchema from "./fuelLogsSchema.js";
import type { DemoCollection } from "./types.js";

export default {
  categoryName: "Car",
  settings: {
    name: "Fuel Logs",
    icon: "⛽",
    description: null,
    assistantInstructions: [
      '- Use reasonable values for liters and total cost. E.g., if I say I put "5304" liters, or "5,3,0,4 liters", I probably mean 53.04, even if I didn\'t specify the decimal or just gave a list of numbers.',
      "- Default to full tank if I don't specify it.",
      "- Always ask for the odometer reading.",
    ].join("\n"),
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
  documents: fuelLogsData,
  app: {
    type: AppType.CollectionView,
    name: "Fuel Stats",
    files: {
      "/main.tsx": {
        source: fuelLogsAppSource,
        compiled: fuelLogsAppCompiled,
      },
    },
  },
} satisfies DemoCollection;

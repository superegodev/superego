import type { CollectionDefinition } from "@superego/backend";
import calendarEntriesSchema from "./calendarSchema.js";

export default {
  settings: {
    name: "Calendar",
    icon: "📅",
    description: null,
    assistantInstructions: "- If duration not supplied, default to 1 hour",
    collectionCategoryId: "ProtoCollectionCategory_0",
    defaultCollectionViewAppId: "ProtoApp_0",
  },
  schema: calendarEntriesSchema,
  versionSettings: {
    contentBlockingKeysGetter: null,
    contentSummaryGetter: {
      source: `
import type { CalendarEntry } from "./CollectionSchema.js";

export default function getContentSummary(
  calendarEntry: CalendarEntry,
): Record<string, string | number | boolean | null> {
  return {
    "{position:0,sortable:true} Title": calendarEntry.title,
    "{position:1,sortable:true,default-sort:asc} Start": calendarEntry.startTime,
    "{position:2,sortable:true} End": calendarEntry.endTime,
    "{position:3,sortable:true} Type": calendarEntry.type,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(calendarEntry) {
  return {
    "{position:0,sortable:true} Title": calendarEntry.title,
    "{position:1,sortable:true,default-sort:asc} Start": calendarEntry.startTime,
    "{position:2,sortable:true} End": calendarEntry.endTime,
    "{position:3,sortable:true} Type": calendarEntry.type,
  };
}
      `.trim(),
    },
  },
} as const satisfies CollectionDefinition<true, true>;

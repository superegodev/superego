import calendarEntriesData from "./calendarEntriesData.js";
import calendarEntriesSchema from "./calendarEntriesSchema.js";
import type { DemoCollection } from "./types.js";

export default {
  categoryName: null,
  settings: {
    name: "Calendar",
    icon: "📅",
    description: null,
    assistantInstructions:
      "- If the duration is not supplied for events, default to them being 1 hour long.",
  },
  schema: calendarEntriesSchema,
  versionSettings: {
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
  documents: calendarEntriesData,
} satisfies DemoCollection;

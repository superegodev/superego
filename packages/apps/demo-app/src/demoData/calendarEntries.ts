import { DocumentVersionCreator } from "@superego/backend";
import type {
  CollectionEntity,
  CollectionVersionEntity,
  DocumentEntity,
  DocumentVersionEntity,
} from "@superego/executing-backend";
import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import calendarEntries from "./calendarEntries.json" with { type: "json" };

const collection: CollectionEntity = {
  id: Id.generate.collection(),
  settings: {
    name: "Calendar",
    icon: "📅",
    collectionCategoryId: null,
    description: null,
    assistantInstructions:
      "- If the duration is not supplied for events, default to them being 1 hour long.",
  },
  createdAt: new Date(),
};

const collectionVersion: CollectionVersionEntity = {
  id: Id.generate.collectionVersion(),
  previousVersionId: null,
  collectionId: collection.id,
  schema: {
    types: {
      Type: {
        description: "Type of a calendar entry.",
        dataType: DataType.Enum,
        members: {
          Event: {
            description:
              "An event, with a defined start time and a defined end time",
            value: "Event",
          },
          Reminder: {
            description:
              "A reminder, with a defined start time but no end time",
            value: "Reminder",
          },
        },
      },
      CalendarEntry: {
        description: "An entry in my calendar.",
        dataType: DataType.Struct,
        properties: {
          type: {
            description: "The type of the entry.",
            dataType: null,
            ref: "Type",
          },
          title: {
            description: "Short title for the entry. 5 words max.",
            dataType: DataType.String,
          },
          startTime: {
            description: "When the event or reminder starts.",
            dataType: DataType.String,
            format: "dev.superego:String.Instant",
          },
          endTime: {
            description: "When the event or reminder ends. Null for reminders.",
            dataType: DataType.String,
            format: "dev.superego:String.Instant",
          },
          notes: {
            description: "Misc notes.",
            dataType: DataType.JsonObject,
            format: "dev.superego:JsonObject.TiptapRichText",
          },
        },
        nullableProperties: ["endTime", "notes"],
      },
    },
    rootType: "CalendarEntry",
  },
  settings: {
    contentSummaryGetter: {
      source: `
import type { CalendarEntry } from "./CollectionSchema";

export default function getContentSummary(
  calendarEntry: CalendarEntry,
): Record<string, string> {
  return {
    "0. Title": calendarEntry.title,
    "1. Start": LocalInstant.fromISO(calendarEntry.startTime).toFormat({
      dateStyle: "short",
      timeStyle: "short",
    }),
    "2. End": calendarEntry.endTime
      ? LocalInstant.fromISO(calendarEntry.endTime).toFormat({
          dateStyle: "short",
          timeStyle: "short",
        })
      : "",
    "3. Type": calendarEntry.type,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(calendarEntry) {
  return {
    "0. Title": calendarEntry.title,
    "1. Start": LocalInstant.fromISO(calendarEntry.startTime).toFormat({
      dateStyle: "short",
      timeStyle: "short",
    }),
    "2. End": calendarEntry.endTime
      ? LocalInstant.fromISO(calendarEntry.endTime).toFormat({
        dateStyle: "short",
        timeStyle: "short",
      })
      : "",
    "3. Type": calendarEntry.type,
  };
}
      `.trim(),
    },
  },
  migration: null,
  createdAt: new Date(),
};

const documents: DocumentEntity[] = [];
const documentVersions: DocumentVersionEntity[] = [];

for (const calendarEntry of calendarEntries) {
  const document: DocumentEntity = {
    id: Id.generate.document(),
    collectionId: collection.id,
    createdAt: new Date(),
  };
  const documentVersion: DocumentVersionEntity = {
    id: Id.generate.documentVersion(),
    previousVersionId: null,
    collectionId: collection.id,
    documentId: document.id,
    collectionVersionId: collectionVersion.id,
    conversationId: null,
    content: calendarEntry,
    createdBy: DocumentVersionCreator.User,
    createdAt: new Date(),
  };
  documents.push(document);
  documentVersions.push(documentVersion);
}

export default { collection, collectionVersion, documents, documentVersions };

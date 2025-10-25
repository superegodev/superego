import { DocumentVersionCreator } from "@superego/backend";
import type {
  CollectionEntity,
  CollectionVersionEntity,
  DocumentEntity,
  DocumentVersionEntity,
} from "@superego/executing-backend";
import { Id } from "@superego/shared-utils";
import calendarEntries from "./calendarEntriesData.js";
import calendarEntriesSchema from "./calendarEntriesSchema.js";

const collection: CollectionEntity = {
  id: Id.generate.collection(),
  settings: {
    name: "Calendar",
    icon: "📅",
    collectionCategoryId: null,
    defaultCollectionViewAppId: null,
    description: null,
    assistantInstructions:
      "- If the duration is not supplied for events, default to them being 1 hour long.",
  },
  remote: null,
  createdAt: new Date(),
};

const collectionVersion: CollectionVersionEntity = {
  id: Id.generate.collectionVersion(),
  previousVersionId: null,
  collectionId: collection.id,
  schema: calendarEntriesSchema,
  settings: {
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
  migration: null,
  remoteConverters: null,
  createdAt: new Date(),
};

const documents: DocumentEntity[] = [];
const documentVersions: DocumentVersionEntity[] = [];

for (const calendarEntry of calendarEntries) {
  const document: DocumentEntity = {
    id: Id.generate.document(),
    remoteId: null,
    remoteUrl: null,
    latestRemoteDocument: null,
    collectionId: collection.id,
    createdAt: new Date(),
  };
  const documentVersion: DocumentVersionEntity = {
    id: Id.generate.documentVersion(),
    remoteId: null,
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

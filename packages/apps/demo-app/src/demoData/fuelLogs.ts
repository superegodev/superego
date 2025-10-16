import { DocumentVersionCreator } from "@superego/backend";
import type {
  CollectionEntity,
  CollectionVersionEntity,
  DocumentEntity,
  DocumentVersionEntity,
} from "@superego/executing-backend";
import { Id } from "@superego/shared-utils";
import { Car } from "./collectionCategories.js";
import fuelLogs from "./fuelLogsData.js";
import fuelLogsSchema from "./fuelLogsSchema.js";

const collection: CollectionEntity = {
  id: Id.generate.collection(),
  settings: {
    name: "Fuel Logs",
    icon: "⛽",
    collectionCategoryId: Car.id,
    description: null,
    assistantInstructions: [
      '- Use reasonable values for liters and total cost. E.g., if I say I put "5304" liters, or "5,3,0,4 liters", I probably mean 53.04, even if I didn\'t specify the decimal or just gave a list of numbers.',
      "- Default to full tank if I don't specify it.",
      "- Always ask for the odometer reading.",
    ].join("\n"),
  },
  remote: null,
  createdAt: new Date(),
};

const collectionVersion: CollectionVersionEntity = {
  id: Id.generate.collectionVersion(),
  previousVersionId: null,
  collectionId: collection.id,
  schema: fuelLogsSchema,
  settings: {
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
  migration: null,
  remoteConverters: null,
  createdAt: new Date(),
};

const documents: DocumentEntity[] = [];
const documentVersions: DocumentVersionEntity[] = [];

for (const fuelLog of fuelLogs) {
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
    content: fuelLog,
    createdBy: DocumentVersionCreator.User,
    createdAt: new Date(),
  };
  documents.push(document);
  documentVersions.push(documentVersion);
}

export default { collection, collectionVersion, documents, documentVersions };

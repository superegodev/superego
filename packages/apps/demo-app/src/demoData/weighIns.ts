import { DocumentVersionCreator } from "@superego/backend";
import type {
  CollectionEntity,
  CollectionVersionEntity,
  DocumentEntity,
  DocumentVersionEntity,
} from "@superego/executing-backend";
import { Id } from "@superego/shared-utils";
import { Health } from "./collectionCategories.js";
import weighIns from "./weighInsData.js";
import weighInsSchema from "./weighInsSchema.js";

const collection: CollectionEntity = {
  id: Id.generate.collection(),
  settings: {
    name: "Weigh-ins",
    icon: "⚖️",
    collectionCategoryId: Health.id,
    description: null,
    assistantInstructions: [
      "- Defaults for things I don't specify:",
      "  - Scale -> Garmin Index S2.",
    ].join("\n"),
  },
  remote: null,
  createdAt: new Date(),
};

const collectionVersion: CollectionVersionEntity = {
  id: Id.generate.collectionVersion(),
  previousVersionId: null,
  collectionId: collection.id,
  schema: weighInsSchema,
  settings: {
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
  migration: null,
  remoteConverters: null,
  createdAt: new Date(),
};

const documents: DocumentEntity[] = [];
const documentVersions: DocumentVersionEntity[] = [];

for (const weighIn of weighIns) {
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
    content: weighIn,
    createdBy: DocumentVersionCreator.User,
    createdAt: new Date(),
  };
  documents.push(document);
  documentVersions.push(documentVersion);
}

export default { collection, collectionVersion, documents, documentVersions };

import { AppType, DocumentVersionCreator } from "@superego/backend";
import type {
  AppEntity,
  AppVersionEntity,
  CollectionEntity,
  CollectionVersionEntity,
  DocumentEntity,
  DocumentVersionEntity,
} from "@superego/executing-backend";
import { Id } from "@superego/shared-utils";
import { Finance } from "./collectionCategories.js";
import expensesAppCompiled from "./expenses.appCompiled.js?raw";
import expensesAppSource from "./expenses.appSource.js?raw";
import expenses from "./expensesData.js";
import expensesSchema from "./expensesSchema.js";

const appId = Id.generate.app();

const collection: CollectionEntity = {
  id: Id.generate.collection(),
  settings: {
    name: "Expenses",
    icon: "💸",
    collectionCategoryId: Finance.id,
    defaultCollectionViewAppId: appId,
    description: null,
    assistantInstructions: [
      "- Defaults for things I don't specify:",
      "  - Currency -> EUR.",
      "  - Payment method -> Credit Card.",
    ].join("\n"),
  },
  remote: null,
  createdAt: new Date(),
};

const collectionVersion: CollectionVersionEntity = {
  id: Id.generate.collectionVersion(),
  previousVersionId: null,
  collectionId: collection.id,
  schema: expensesSchema,
  settings: {
    contentSummaryGetter: {
      source: `
import type { Expense } from "./CollectionSchema.js";

export default function getContentSummary(
  expense: Expense
): Record<string, string | number | boolean | null> {
  return {
    "{position:0,sortable:true} Title": expense.title,
    "{position:1,sortable:true,default-sort:desc} Date": expense.date,
    "{position:2,sortable:true} Amount": expense.amount,
    "{position:3,sortable:true} Currency": expense.currency,
    "{position:4,sortable:true} Category": expense.category,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(expense) {
  return {
    "{position:0,sortable:true} Title": expense.title,
    "{position:1,sortable:true,default-sort:desc} Date": expense.date,
    "{position:2,sortable:true} Amount": expense.amount,
    "{position:3,sortable:true} Currency": expense.currency,
    "{position:4,sortable:true} Category": expense.category,
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

for (const expense of expenses) {
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
    content: expense,
    createdBy: DocumentVersionCreator.User,
    createdAt: new Date(),
  };
  documents.push(document);
  documentVersions.push(documentVersion);
}

const app: AppEntity = {
  id: appId,
  type: AppType.CollectionView,
  name: "Expense Stats",
  createdAt: new Date(),
};

const appVersion: AppVersionEntity = {
  id: Id.generate.appVersion(),
  previousVersionId: null,
  appId: app.id,
  targetCollections: [{ id: collection.id, versionId: collectionVersion.id }],
  files: {
    "/main.tsx": {
      source: expensesAppSource
        .replaceAll("$COLLECTION_ID", collection.id)
        .replaceAll("$COLLECTION_VERSION_ID", collectionVersion.id),
      compiled: expensesAppCompiled
        .replaceAll("$COLLECTION_ID", collection.id)
        .replaceAll("$COLLECTION_VERSION_ID", collectionVersion.id),
    },
  },
  createdAt: new Date(),
};

export default {
  collection,
  collectionVersion,
  documents,
  documentVersions,
  app,
  appVersion,
};

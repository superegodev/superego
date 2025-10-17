import { DocumentVersionCreator } from "@superego/backend";
import type {
  CollectionEntity,
  CollectionVersionEntity,
  DocumentEntity,
  DocumentVersionEntity,
} from "@superego/executing-backend";
import { Id } from "@superego/shared-utils";
import contacts from "./contactsData.js";
import contactsSchema from "./contactsSchema.js";

const collection: CollectionEntity = {
  id: Id.generate.collection(),
  settings: {
    name: "Contacts",
    icon: "️📞️",
    collectionCategoryId: null,
    description: null,
    assistantInstructions: null,
  },
  remote: null,
  createdAt: new Date(),
};

const collectionVersion: CollectionVersionEntity = {
  id: Id.generate.collectionVersion(),
  previousVersionId: null,
  collectionId: collection.id,
  schema: contactsSchema,
  settings: {
    contentSummaryGetter: {
      source: `
import type { Contact } from "./CollectionSchema.js";

export default function getContentSummary(
  contact: Contact,
): Record<string, string | boolean | null> {
  return {
    "{position:0,sortable:true,default-sort:asc} Name": contact.name,
    "{position:1} Relation": contact.relation,
    "{position:2} Phone": contact.phones[0]?.number ?? null,
    "{position:3} Email": contact.emails[0]?.address ?? null,
    "{position:4,sortable:true} Type": contact.type,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(contact) {
  return {
    "{position:0,sortable:true,default-sort:asc} Name": contact.name,
    "{position:1} Relation": contact.relation,
    "{position:2} Phone": contact.phones[0]?.number ?? null,
    "{position:3} Email": contact.emails[0]?.address ?? null,
    "{position:4,sortable:true} Type": contact.type,
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

for (const contact of contacts) {
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
    content: contact,
    createdBy: DocumentVersionCreator.User,
    createdAt: new Date(),
  };
  documents.push(document);
  documentVersions.push(documentVersion);
}

export default { collection, collectionVersion, documents, documentVersions };

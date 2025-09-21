import { DocumentVersionCreator } from "@superego/backend";
import type {
  CollectionEntity,
  CollectionVersionEntity,
  DocumentEntity,
  DocumentVersionEntity,
} from "@superego/executing-backend";
import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import contacts from "./contacts.json" with { type: "json" };

const collection: CollectionEntity = {
  id: Id.generate.collection(),
  settings: {
    name: "Contacts",
    icon: "️📞️",
    collectionCategoryId: null,
    description: null,
    assistantInstructions: null,
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
        description: "Type of contact.",
        dataType: DataType.Enum,
        members: {
          Person: {
            description: "A single human",
            value: "Person",
          },
          Organization: {
            description: "A company, non-profit, government entity, group, etc",
            value: "Organization",
          },
        },
      },
      Phone: {
        dataType: DataType.Struct,
        properties: {
          number: {
            description: "The actual phone number.",
            dataType: DataType.String,
          },
          description: {
            description:
              "A description for the phone number. (Personal, work, etc.)",
            dataType: DataType.String,
          },
        },
        nullableProperties: ["description"],
      },
      Email: {
        dataType: DataType.Struct,
        properties: {
          address: {
            description: "The actual email address.",
            dataType: DataType.String,
          },
          description: {
            description:
              "A description for the email address. (Personal, work, etc.)",
            dataType: DataType.String,
          },
        },
        nullableProperties: ["description"],
      },
      Contact: {
        description: "A contact in my address book.",
        dataType: DataType.Struct,
        properties: {
          type: {
            dataType: null,
            ref: "Type",
          },
          name: {
            description:
              "Name of the contact. Either the full name for a person, or the organization name for an organization.",
            dataType: DataType.String,
          },
          relation: {
            description: "Who they are to me.",
            dataType: DataType.String,
          },
          phones: {
            description: "Their phone numbers",
            dataType: DataType.List,
            items: {
              dataType: null,
              ref: "Phone",
            },
          },
          emails: {
            description: "Their email addresses",
            dataType: DataType.List,
            items: {
              dataType: null,
              ref: "Email",
            },
          },
          notes: {
            description: "Misc notes about the contact",
            dataType: DataType.JsonObject,
            format: "dev.superego:JsonObject.TiptapRichText",
          },
        },
        nullableProperties: ["relation", "notes"],
      },
    },
    rootType: "Contact",
  },
  settings: {
    contentSummaryGetter: {
      source: `
import type { Contact } from "./CollectionSchema";

export default function getContentSummary(
  contact: Contact,
): Record<string, string> {
  return {
    "0. Name": contact.name,
    "1. Relation": contact.relation ?? "",
    "2. Phone": contact.phones[0]?.number ?? "",
    "3. Email": contact.emails[0]?.address ?? "",
    "4. Type": contact.type
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(contact) {
  return {
    "0. Name": contact.name,
    "1. Relation": contact.relation ?? "",
    "2. Phone": contact.phones[0]?.number ?? "",
    "3. Email": contact.emails[0]?.address ?? "",
    "4. Type": contact.type
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

for (const contact of contacts) {
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
    content: contact,
    createdBy: DocumentVersionCreator.User,
    createdAt: new Date(),
  };
  documents.push(document);
  documentVersions.push(documentVersion);
}

export default { collection, collectionVersion, documents, documentVersions };

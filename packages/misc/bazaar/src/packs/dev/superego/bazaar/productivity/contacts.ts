import type { CollectionDefinition } from "@superego/backend";
import contactsSchema from "./contactsSchema.js";

export default {
  settings: {
    name: "Contacts",
    icon: "☎️",
    description: "Personal address book.",
    assistantInstructions: null,
    collectionCategoryId: "ProtoCollectionCategory_0",
    defaultCollectionViewAppId: null,
  },
  schema: contactsSchema,
  versionSettings: {
    contentBlockingKeysGetter: {
      source: `
import type { Contact } from "./CollectionSchema.js";

export default function getContentBlockingKeys(contact: Contact): string[] {
  return [
    \`name:\${contact.name.toLowerCase().trim()}\`,
    ...contact.emails.map((e) => \`email:\${e.address.toLowerCase().trim()}\`),
    ...contact.phones.map((p) => \`phone:\${p.number.replace(/\\s/g, "")}\`),
  ];
}
      `.trim(),
      compiled: `
export default function getContentBlockingKeys(contact) {
  return [
    \`name:\${contact.name.toLowerCase().trim()}\`,
    ...contact.emails.map((e) => \`email:\${e.address.toLowerCase().trim()}\`),
    ...contact.phones.map((p) => \`phone:\${p.number.replace(/\\s/g, "")}\`),
  ];
}
      `.trim(),
    },
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
    defaultDocumentViewUiOptions: null,
  },
} as const satisfies CollectionDefinition<true, true>;

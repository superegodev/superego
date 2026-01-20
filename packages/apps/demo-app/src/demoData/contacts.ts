import contactsData from "./contactsData.js";
import contactsSchema from "./contactsSchema.js";
import type { DemoCollection } from "./types.js";

export default {
  categoryName: null,
  settings: {
    name: "Contacts",
    icon: "☎️",
    description: null,
    assistantInstructions: null,
  },
  schema: contactsSchema,
  versionSettings: {
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
  contentBlockingKeysGetter: {
    source: `
import type { Contact } from "./CollectionSchema.js";

export default function getContentBlockingKeys(contact: Contact): string[] {
  return [
    \`type:\${contact.type}\`,
    \`name:\${contact.name.toLowerCase()}\`
  ];
}
    `.trim(),
    compiled: `
export default function getContentBlockingKeys(contact) {
  return [
    \`type:\${contact.type}\`,
    \`name:\${contact.name.toLowerCase()}\`
  ];
}
    `.trim(),
  },
  documents: contactsData,
} satisfies DemoCollection;

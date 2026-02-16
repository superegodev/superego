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
    defaultDocumentViewUiOptions: {
      fullWidth: true,
      alwaysCollapsePrimarySidebar: true,
      rootLayout: {
        "(min-width: 65rem)": [
          {
            style: {
              display: "grid",
              gridTemplateColumns: "5fr 3fr",
              columnGap: "var(--section-horizontal-gap)",
              height: "100%",
            },
            children: [
              {
                style: {
                  position: "sticky",
                  height: "var(--visible-area-height)",
                  top: "var(--visible-area-top)",
                },
                children: [{ propertyPath: "notes", grow: true }],
              },
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--field-vertical-gap)",
                },
                children: [
                  { propertyPath: "type" },
                  { propertyPath: "name" },
                  { propertyPath: "relation" },
                  {
                    propertyPath: "phones.$",
                    layout: [
                      {
                        style: {
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          columnGap: "var(--field-horizontal-gap)",
                        },
                        children: [
                          { propertyPath: "number" },
                          { propertyPath: "description" },
                        ],
                      },
                    ],
                  },
                  {
                    propertyPath: "emails.$",
                    layout: [
                      {
                        style: {
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          columnGap: "var(--field-horizontal-gap)",
                        },
                        children: [
                          { propertyPath: "address" },
                          { propertyPath: "description" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        all: [
          { propertyPath: "type" },
          { propertyPath: "name" },
          { propertyPath: "relation" },
          {
            propertyPath: "phones.$",
            layout: [
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  columnGap: "var(--field-horizontal-gap)",
                },
                children: [
                  { propertyPath: "number" },
                  { propertyPath: "description" },
                ],
              },
            ],
          },
          {
            propertyPath: "emails.$",
            layout: [
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  columnGap: "var(--field-horizontal-gap)",
                },
                children: [
                  { propertyPath: "address" },
                  { propertyPath: "description" },
                ],
              },
            ],
          },
          { propertyPath: "notes" },
        ],
      },
    },
  },
} as const satisfies CollectionDefinition<true, true>;

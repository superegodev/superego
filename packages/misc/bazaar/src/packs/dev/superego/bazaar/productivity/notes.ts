import type { CollectionDefinition } from "@superego/backend";
import notesSchema from "./notesSchema.js";

export default {
  settings: {
    name: "Notes",
    icon: "📝",
    description: "A collection of notes.",
    assistantInstructions: null,
    collectionCategoryId: "ProtoCollectionCategory_0",
    defaultCollectionViewAppId: null,
  },
  schema: notesSchema,
  versionSettings: {
    contentBlockingKeysGetter: null,
    contentSummaryGetter: {
      source: `
import type { Note } from "./CollectionSchema.js";

export default function getContentSummary(
  note: Note,
): Record<string, string | null> {
  return {
    "{position:0,sortable:true,default-sort:asc} Title": note.title,
    "{position:1,sortable:true} Date": note.date,
    "{position:2} Tags": note.tags.join(", ") || null,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(note) {
  return {
    "{position:0,sortable:true,default-sort:asc} Title": note.title,
    "{position:1,sortable:true} Date": note.date,
    "{position:2} Tags": note.tags.join(", ") || null,
  };
}
      `.trim(),
    },
    defaultDocumentViewUiOptions: {
      fullWidth: true,
      alwaysCollapsePrimarySidebar: false,
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
                  display: "flex",
                  flexDirection: "column",
                },
                children: [{ propertyPath: "note", flexGrow: true }],
              },
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--field-vertical-gap)",
                },
                children: [
                  { propertyPath: "title" },
                  { propertyPath: "date" },
                  { propertyPath: "tags" },
                ],
              },
            ],
          },
        ],
        all: [
          { propertyPath: "title" },
          { propertyPath: "date" },
          { propertyPath: "tags" },
          { propertyPath: "note" },
        ],
      },
    },
  },
} as const satisfies CollectionDefinition<true, true>;

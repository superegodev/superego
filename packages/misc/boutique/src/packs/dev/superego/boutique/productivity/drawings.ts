import type { CollectionDefinition } from "@superego/backend";
import drawingsSchema from "./drawingsSchema.js";

export default {
  settings: {
    name: "Drawings",
    icon: "🎨",
    description: null,
    assistantInstructions: null,
    collectionCategoryId: "ProtoCollectionCategory_0",
    defaultCollectionViewAppId: null,
  },
  schema: drawingsSchema,
  versionSettings: {
    contentBlockingKeysGetter: null,
    contentSummaryGetter: {
      source: `
import type { Drawing } from "./CollectionSchema.js";

export default function getContentSummary(
  drawing: Drawing,
): Record<string, string | boolean | null> {
  return {
    "{position:0,sortable:true,default-sort:asc} Title": drawing.title,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(drawing) {
  return {
    "{position:0,sortable:true,default-sort:asc} Title": drawing.title,
  };
}
      `.trim(),
    },
    defaultDocumentViewUiOptions: {
      fullWidth: true,
      alwaysCollapsePrimarySidebar: true,
      rootLayout: {
        all: [
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "var(--field-vertical-gap)",
              height: "var(--visible-area-height)",
            },
            children: [
              { propertyPath: "drawing", flexGrow: true },
              { propertyPath: "title" },
            ],
          },
        ],
      },
    },
  },
} as const satisfies CollectionDefinition<true, true>;

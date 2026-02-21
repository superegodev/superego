import type { CollectionDefinition } from "@superego/backend";
import tasksSchema from "./tasksSchema.js";

export default {
  settings: {
    name: "Tasks",
    icon: "✅️",
    description: "Task manager.",
    assistantInstructions: null,
    collectionCategoryId: "ProtoCollectionCategory_0",
    defaultCollectionViewAppId: "ProtoApp_1",
  },
  schema: tasksSchema,
  versionSettings: {
    contentBlockingKeysGetter: null,
    contentSummaryGetter: {
      source: `
import type { Task } from "../generated/ProtoCollection_0.js";

export default function getContentSummary(
  task: Task
): Record<string, string | number | boolean | null> {
  return {
    "{position:0,sortable:true} Title": task.title,
    "{position:1,sortable:true} Stage": task.stage,
    "{position:2,sortable:true} Due Date": task.dueDate,
    "{position:3,sortable:true,default-sort:asc} Priority": task.priority,
    "{position:4} Archived": task.archived,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(
  task
) {
  return {
    "{position:0,sortable:true} Title": task.title,
    "{position:1,sortable:true} Stage": task.stage,
    "{position:2,sortable:true} Due Date": task.dueDate,
    "{position:3,sortable:true,default-sort:asc} Priority": task.priority,
    "{position:4} Archived": task.archived,
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
              gridTemplateColumns: "2fr 1fr",
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
                  gap: "var(--field-vertical-gap)",
                },
                children: [
                  { propertyPath: "title" },
                  { propertyPath: "description", flexGrow: true },
                ],
              },
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--field-vertical-gap)",
                },
                children: [
                  { propertyPath: "stage" },
                  { propertyPath: "dueDate" },
                  { propertyPath: "priority" },
                  { propertyPath: "archived" },
                ],
              },
            ],
          },
        ],
        "(min-width: 45rem)": [
          {
            style: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
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
                  gap: "var(--field-vertical-gap)",
                },
                children: [
                  { propertyPath: "title" },
                  { propertyPath: "description", flexGrow: true },
                ],
              },
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--field-vertical-gap)",
                },
                children: [
                  { propertyPath: "stage" },
                  { propertyPath: "dueDate" },
                  { propertyPath: "priority" },
                  { propertyPath: "archived" },
                ],
              },
            ],
          },
        ],
        all: [
          { propertyPath: "title" },
          { propertyPath: "description" },
          { propertyPath: "stage" },
          { propertyPath: "dueDate" },
          { propertyPath: "priority" },
          { propertyPath: "archived" },
        ],
      },
    },
  },
} as const satisfies CollectionDefinition<true, true>;

import type { Backend } from "@superego/backend";
import LocalInstantDeclaration from "@superego/javascript-sandbox-global-utils/LocalInstant.d.ts?raw";
import { codegen, type Schema } from "@superego/schema";
import { lowerFirst } from "es-toolkit";

// TODO: move to dedicated package when refactoring CollectionCreator and the
// "app creator" assistants.
export default function getImplementContentSummaryGetterSpec(
  schema: Schema,
): Parameters<Backend["inference"]["implementTypescriptModule"]>[0] {
  const template = getContentSummaryGetterTemplate(schema);
  return {
    description: `
The "content summary" of a document is an object—derived from the document's
content—that contains its most important bits of information. The properties of
the object are displayed when showing a "summary view" of the document; for
example, in tables where each property becomes a column.

This module implements and default-exports the function that derives the summary
from the document content.

### Additional info

The property names of the summary object can include an "attributes" prefix that
configures the behavior of the UIs that render the summary. Examples:

- \`"{position:0,sortable:true,default-sort:asc} Prop Zero"\`:
  - property displayed first;
  - when rendered in a table, the property's column is sortable;
  - when rendered in a table, the table is—by default—sorted by the property's
    column, in ascending order.
- \`"{position:1} Prop One"\`:
  - property displayed second;
  - when rendered in a table, the property's column is not sortable.

(Note: it only makes sense to define \`default-sort\` for one property.)
        `.trim(),
    rules: `
- The content summary object must have between 1 and 5 properties.
- Only include the most salient and useful pieces of information.
- A summary property doesn't necessarily need to have a 1-to-1 correspondence
  with a document property: it can be a value derived from more than one
  document properties.
- The properties must always exist, but you can use \`null\` for empty values.
        `.trim(),
    additionalInstructions: null,
    template: template,
    libs: [
      { path: "/CollectionSchema.ts", source: codegen(schema) },
      { source: LocalInstantDeclaration, path: "/LocalInstant.d.ts" },
    ],
    startingPoint: {
      path: "/getContentSummaryGetter.ts",
      source: template,
    },
    userRequest: "Complete the implementation.",
  };
}

function getContentSummaryGetterTemplate(schema: Schema): string {
  const { rootType } = schema;
  const argName = lowerFirst(rootType);
  return [
    `import type { ${rootType} } from "./CollectionSchema.js";`,
    "",
    "export default function getContentSummary(",
    `  ${argName}: ${rootType}`,
    "): Record<string, string | number | boolean | null> {",
    "  return {};",
    "}",
  ].join("\n");
}

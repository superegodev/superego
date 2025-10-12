import {
  type Collection,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import LocalInstantTypeDeclaration from "@superego/javascript-sandbox-global-utils/LocalInstant.d.ts?raw";
import { makeUnsuccessfulResult } from "@superego/shared-utils";
import { DateTime } from "luxon";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeResultError from "../../../makers/makeResultError.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type JavascriptSandbox from "../../../requirements/JavascriptSandbox.js";
import type DocumentsList from "../../../usecases/documents/List.js";
import { toAssistantDocument } from "../utils/AssistantDocument.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.ExecuteJavascriptFunction {
    return toolCall.tool === ToolName.ExecuteJavascriptFunction;
  },

  async exec(
    toolCall: ToolCall.ExecuteJavascriptFunction,
    collections: Collection[],
    documentsList: DocumentsList,
    javascriptSandbox: JavascriptSandbox,
  ): Promise<ToolResult.ExecuteJavascriptFunction> {
    const { collectionId, javascriptFunction } = toolCall.input;

    const collection = collections.find(({ id }) => id === collectionId);
    if (!collection) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", { collectionId }),
        ),
      };
    }

    const { data: documents, error: documentsListError } =
      await documentsList.exec(collectionId, false);
    if (documentsListError) {
      throw new UnexpectedAssistantError(
        [
          `Listing documents failed with ${documentsListError.name}.`,
          documentsListError.name === "UnexpectedError"
            ? ` Cause: ${documentsListError.details.cause}`
            : "",
        ].join(""),
      );
    }

    const assistantDocuments = documents.map((document) =>
      toAssistantDocument(
        collection.latestVersion.schema,
        document,
        DateTime.local().zoneName,
      ),
    );
    const result = await javascriptSandbox.executeSyncFunction(
      { source: "", compiled: javascriptFunction },
      [assistantDocuments],
    );

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: result,
    } as ToolResult.ExecuteJavascriptFunction;
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.ExecuteJavascriptFunction,
      description: `
Runs a **synchronous**, **read-only** JS function over **all documents** in a
collection; returns a JSON-safe result (counts, aggregates, short lists, or
specific docs). Use this to **search** for a document (e.g., by weighed
criteria), **fetch** a specific item by \`id\`, or compute aggregates.

### Documents

\`\`\`ts
interface Document {
  id: string; // document ID
  versionId: string; // current document version ID
  content: any; // conforms to the collection schema
}
\`\`\`

### Rules

- Pure JavaScript, no TypeScript types.
- No \`async\`, timers, or network.
- No \`import\` or \`require\`. They are not defined and they'll throw an error.
- Only use fields defined in the schema.
- Return **JSON-safe** values only (convert Dates to ISO strings if returning
  them).
- The function must be default-exported.
- Comment at least 40% of lines with brief explanations of intent,
  plus a one-sentence docstring per function.

### Working with dates and times

Always use the global class \`LocalInstant\` helper for **all** date/time
parsing, math, and formatting. It runs in the user’s timezone and correctly
handles DST shifts, leap years, end-of-month rollovers, and locale formatting.
Prefer \`LocalInstant\` over native \`Date\` arithmetic.

\`\`\`ts
${LocalInstantTypeDeclaration}
\`\`\`ts

#### Usage examples

To get the date "tomorrow at 9":
\`\`\`js
LocalInstant
  .now()
  .plus({ days: 1 })
  .set({ hour: 9 })
  .startOf("hour")
  .toISO();
\`\`\`

To get the date "next Friday at 11":
\`\`\`js
LocalInstant
  .now()
  .plus({ weeks: 1 })
  .set({ isoWeekday: 5, hour: 11 })
  .startOf("hour")
  .toISO();
\`\`\`

To compare a document string field with format \`dev.superego:String:Instant\`
(ISO8601 with millisecond precision and time offset):
\`\`\`js
const now = new Date();
const timestamp = new Date(document.timestamp);
const threeHoursAgo = LocalInstant
  .now()
  .minus({ hours: 3 })
  .toJSDate();
const isInThePast3Hours = timestamp <= now && timestamp >= threeHoursAgo;
\`\`\`
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: "string",
          },
          javascriptFunction: {
            description:
              "JavaScript source string implementing `export default function main(documents) { … }`",
            type: "string",
          },
        },
        required: ["collectionId", "javascriptFunction"],
        additionalProperties: false,
      },
    };
  },
};

import { type ToolCall, ToolName, type ToolResult } from "@superego/backend";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeUnsuccessfulResult from "../../../makers/makeUnsuccessfulResult.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type JavascriptSandbox from "../../../requirements/JavascriptSandbox.js";
import type DocumentsList from "../../../usecases/documents/List.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.ExecuteJavascriptFunction {
    return toolCall.tool === ToolName.ExecuteJavascriptFunction;
  },

  async exec(
    toolCall: ToolCall.ExecuteJavascriptFunction,
    documentsList: DocumentsList,
    javascriptSandbox: JavascriptSandbox,
  ): Promise<ToolResult.ExecuteJavascriptFunction> {
    const { collectionId, javascriptFunction } = toolCall.input;

    const { data: documents, error } = await documentsList.exec(collectionId);

    if (error && error.name === "UnexpectedError") {
      throw new UnexpectedAssistantError(
        `Listing documents failed with UnexpectedError. Cause: ${error.details.cause}`,
      );
    }
    if (error) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(error),
      };
    }

    const assistantDocuments = documents.map((document) => ({
      id: document.id,
      versionId: document.latestVersion.id,
      content: document.latestVersion.content,
    }));
    const result = await javascriptSandbox.executeSyncFunction(
      {
        source: "",
        compiled: javascriptFunction,
      },
      [assistantDocuments],
    );

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: result,
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.ExecuteJavascriptFunction,
      description: `
Run a **synchronous**, **read-only** JS function over **all documents** in a
collection; return a JSON-safe result (counts, aggregates, short lists, or
specific docs).

### Documents

\`\`\`ts
interface Document {
  id: string; // document ID
  versionId: string; // current document version ID
  content: any; // conforms to the collection schema
}
\`\`\`

### Function signature

\`\`\`js
// Optional: helper functions and constants.

export default function main(documents) {
  // compute & return a JSON-safe value
  return result;
}
\`\`\`

### Rules

- No \`async\`, timers, or network.
- Don’t mutate \`documents\`.
- Return **JSON-safe** values only (convert Dates to ISO strings if returning
  them).
- Keep outputs concise unless the user explicitly asked for full lists.
- Use only fields defined in the schema.
- You can use this to **search** (e.g., by natural key), **fetch** a specific
  item by \`id\`, or compute aggregates.
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: "string",
            description:
              "ID of the collection to read (e.g., 'Collection_1234567890').",
          },
          javascriptFunction: {
            type: "string",
            description:
              "JavaScript source string implementing `export default function main(documents) { … }`",
          },
        },
        required: ["collectionId", "javascriptFunction"],
        additionalProperties: false,
      },
    };
  },
};

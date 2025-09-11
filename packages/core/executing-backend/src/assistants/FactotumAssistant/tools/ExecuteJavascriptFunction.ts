import {
  type Collection,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import { DateTime } from "luxon";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeResultError from "../../../makers/makeResultError.js";
import makeUnsuccessfulResult from "../../../makers/makeUnsuccessfulResult.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type JavascriptSandbox from "../../../requirements/JavascriptSandbox.js";
import type DocumentsList from "../../../usecases/documents/List.js";
import { toAssistantDocument } from "../../utils/AssistantDocument.js";

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
      await documentsList.exec(collectionId);
    if (documentsListError && documentsListError.name === "UnexpectedError") {
      throw new UnexpectedAssistantError(
        `Listing documents failed with UnexpectedError. Cause: ${documentsListError.details.cause}`,
      );
    }
    if (documentsListError) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(documentsListError),
      };
    }

    const assistantDocuments = documents.map((document) =>
      toAssistantDocument(
        collection.latestVersion.schema,
        document,
        DateTime.local().zoneName,
      ),
    );
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

- No \`async\`, timers, or network.
- Only use fields defined in the schema.
- Return **JSON-safe** values only (convert Dates to ISO strings if returning
  them).
- The function must be default-exported.
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: "string",
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

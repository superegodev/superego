import {
  type Collection,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { DateTime } from "luxon";
import * as v from "valibot";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeLiteDocument from "../../../makers/makeLiteDocument.js";
import makeResultError from "../../../makers/makeResultError.js";
import makeSuccessfulResult from "../../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../../makers/makeUnsuccessfulResult.js";
import makeValidationIssues from "../../../makers/makeValidationIssues.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type JavascriptSandbox from "../../../requirements/JavascriptSandbox.js";
import type DocumentsList from "../../../usecases/documents/List.js";
import { toAssistantDocument } from "../utils/AssistantDocument.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.RenderDocumentsTable {
    return toolCall.tool === ToolName.RenderDocumentsTable;
  },

  async exec(
    toolCall: ToolCall.RenderDocumentsTable,
    collections: Collection[],
    documentsList: DocumentsList,
    javascriptSandbox: JavascriptSandbox,
  ): Promise<ToolResult.RenderDocumentsTable> {
    const { collectionId, getDocumentIds } = toolCall.input;

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
      { source: "", compiled: getDocumentIds },
      [assistantDocuments],
    );

    if (!result.success) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: result,
      };
    }

    const dataValidationResult = v.safeParse(
      v.array(
        v.pipe(
          v.string(),
          v.check((input) => Id.is.document(input), "Must be a DocumentId"),
        ),
      ),
      result.data,
    );
    if (!dataValidationResult.success) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(
          makeResultError("ReturnValueNotValid", {
            issues: makeValidationIssues(dataValidationResult.issues),
          }),
        ),
      };
    }

    const documentIds = new Set(result.data);
    const filteredDocuments = documents
      .filter(({ id }) => documentIds.has(id))
      .map(makeLiteDocument);

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult(`
The documents table has been successfully rendered. The user can now see it.
Below the table, they'll see your next message. It should say something like
"Here are the documents you asked for". Contextualize to the conversation
though, don't just repeat this example literally.
      `),
      artifacts: { documents: filteredDocuments },
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.RenderDocumentsTable,
      description: `
Renders an inline table of documents in the app UI. Use this tool every time you
want to show a set of documents to the user. For documents, prefer using this
tool over markdown tables.

The getDocumentIds function takes the same parameters as the function in
${ToolName.ExecuteJavascriptFunction} (all the documents in the collection),
executes in the same environment, and **must** abide by ALL its rules.
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: "string",
          },
          title: {
            description: "A short title for the table (5 words max)",
            type: "string",
          },
          getDocumentIds: {
            description:
              "JavaScript function returning an array of ids of the documents to render in the table. `export default function getDocumentIds(documents) { … }`",
            type: "string",
          },
        },
        required: ["collectionId", "title", "getDocumentIds"],
        additionalProperties: false,
      },
    };
  },
};

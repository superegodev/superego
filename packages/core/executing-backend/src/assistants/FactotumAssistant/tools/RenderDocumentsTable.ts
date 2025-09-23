import {
  type Collection,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { uniq } from "es-toolkit";
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

    const documentsTableId = crypto.randomUUID();
    // TODO: utils
    const tableColumns = uniq(
      documents.flatMap((document) =>
        Object.keys(document.latestVersion.contentSummary.data ?? {}),
      ),
    )
      .sort()
      .map((key) => key.replace(/^\d+\.\s+/, ""));
    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult({
        tableColumns: tableColumns,
        markdownSnippet: `<DocumentsTable id="${documentsTableId}" />`,
      }),
      artifacts: { documentsTableId, documents: filteredDocuments },
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.RenderDocumentsTable,
      description: `
Creates an inline table of documents that you can use in your textual responses
by including the \`markdownSnippet\` returned by the tool call. Use this tool
every time you want to show a set of documents to the user. For documents,
prefer using this tool over markdown tables.

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

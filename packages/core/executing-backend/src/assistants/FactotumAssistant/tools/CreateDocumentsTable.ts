import {
  type Collection,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import LocalInstantTypeDeclaration from "@superego/javascript-sandbox-global-utils/LocalInstant.d.ts?raw";
import { codegen } from "@superego/schema";
import {
  ContentSummaryUtils,
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import { DateTime } from "luxon";
import * as v from "valibot";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeLiteDocument from "../../../makers/makeLiteDocument.js";
import makeResultError from "../../../makers/makeResultError.js";
import makeValidationIssues from "../../../makers/makeValidationIssues.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type JavascriptSandbox from "../../../requirements/JavascriptSandbox.js";
import type TypescriptCompiler from "../../../requirements/TypescriptCompiler.js";
import type DocumentsList from "../../../usecases/documents/List.js";
import createMarkdownElementId from "../../utils/createMarkdownElementId.js";
import { toAssistantDocument } from "../utils/AssistantDocument.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.CreateDocumentsTable {
    return toolCall.tool === ToolName.CreateDocumentsTable;
  },

  async exec(
    toolCall: ToolCall.CreateDocumentsTable,
    collections: Collection[],
    documentsList: DocumentsList,
    javascriptSandbox: JavascriptSandbox,
    typescriptCompiler: TypescriptCompiler,
  ): Promise<ToolResult.CreateDocumentsTable> {
    const { collectionId, getDocumentIds: getDocumentIdsTs } = toolCall.input;

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

    const { data: getDocumentIdsJs, error: compileError } =
      await typescriptCompiler.compile(
        { path: "/getDocumentIds.ts", source: getDocumentIdsTs },
        [
          {
            path: `/${collection.id}.ts`,
            source: codegen(collection.latestVersion.schema),
          },
          {
            path: "/LocalInstant.d.ts",
            source: LocalInstantTypeDeclaration,
          },
        ],
      );
    if (compileError) {
      if (compileError.name === "UnexpectedError") {
        throw new UnexpectedAssistantError(
          [
            `Compiling getDocumentIds failed with ${compileError.name}.`,
            ` Cause: ${compileError.details.cause}`,
          ].join(""),
        );
      }
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(compileError),
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
      { source: "", compiled: getDocumentIdsJs },
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

    const documentsTableId = createMarkdownElementId();
    const tableColumns = ContentSummaryUtils.getSortedProperties(
      documents.map((document) => document.latestVersion.contentSummary),
    ).map(({ label }) => label);

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult({
        markdownSnippet: `<DocumentsTable id="${documentsTableId}" />`,
        tableInfo: {
          columns: tableColumns,
          rowCount: filteredDocuments.length,
        },
      }),
      artifacts: { documentsTableId, documents: filteredDocuments },
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.CreateDocumentsTable,
      description: `
Creates an inline table of documents that you can use in your textual responses
by including verbatim the \`markdownSnippet\` returned by the tool call. Use
this tool every time you want to show a set of documents to the user. For
showing documents, always use this tool instead of markdown tables.

This tool is a variant of ${ToolName.ExecuteTypescriptFunction}. The \`getDocumentIds\`
function takes the same parameters as the function in ${ToolName.ExecuteTypescriptFunction}
(all the documents in the collection), executes in the same environment, and
**must** abide by ALL its rules.

### \`getDocumentIds\` template

\`\`\`ts
// This imports the types returned from the ${ToolName.GetCollectionTypescriptSchema} tool call.
// Replace $collectionId with the full id (Collection_xyz...) of the collection
// you're running the function on.
import type * as $collectionId from "./$collectionId.ts";

interface Document {
  // Document ID
  id: string;
  // Current document version ID
  versionId: string;
  // The root type from the collection types. The content is guaranteed to abide
  // by the TypeScript schema.
  content: $collectionId.$rootType;
}

export default function getDocumentIds(documents: Document[]): string[] {
  // Implementation goes here.
}
\`\`\`

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
              "TypeScript function returning an array of ids of the documents to render in the table.",
            type: "string",
          },
        },
        required: ["collectionId", "title", "getDocumentIds"],
        additionalProperties: false,
      },
    };
  },
};

import {
  type Collection,
  type CollectionId,
  type Document,
  type LiteDocument,
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
import type AssistantDocument from "../utils/AssistantDocument.js";
import { toAssistantDocument } from "../utils/AssistantDocument.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.CreateDocumentsTables {
    return toolCall.tool === ToolName.CreateDocumentsTables;
  },

  async exec(
    toolCall: ToolCall.CreateDocumentsTables,
    collections: Collection[],
    documentsList: DocumentsList,
    javascriptSandbox: JavascriptSandbox,
    typescriptCompiler: TypescriptCompiler,
  ): Promise<ToolResult.CreateDocumentsTables> {
    const { collectionIds, getDocumentIds: getDocumentIdsTs } = toolCall.input;
    const uniqueCollectionIds = [...new Set(collectionIds)];
    const collectionsById = new Map(
      collections.map((collection) => [collection.id, collection]),
    );
    const missingCollectionId = uniqueCollectionIds.find(
      (collectionId) => !collectionsById.has(collectionId),
    );
    if (missingCollectionId) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", {
            collectionId: missingCollectionId,
          }),
        ),
      };
    }

    const typeDeclarations = uniqueCollectionIds.map((collectionId) => {
      const collection = collectionsById.get(collectionId)!;
      return {
        path: `/${collectionId}.ts` as `/${string}.ts`,
        source: codegen(collection.latestVersion.schema),
      };
    });

    const { data: getDocumentIdsJs, error: compileError } =
      await typescriptCompiler.compile(
        { path: "/getDocumentIds.ts", source: getDocumentIdsTs },
        [
          ...typeDeclarations,
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

    const documentsByCollection: Record<CollectionId, Document[]> = {};
    const assistantDocumentsByCollection: Record<
      CollectionId,
      AssistantDocument[]
    > = {};

    for (const collectionId of uniqueCollectionIds) {
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
      const collection = collectionsById.get(collectionId)!;
      documentsByCollection[collectionId] = documents;
      assistantDocumentsByCollection[collectionId] = documents.map((document) =>
        toAssistantDocument(
          collection.latestVersion.schema,
          document,
          DateTime.local().zoneName,
        ),
      );
    }

    const result = await javascriptSandbox.executeSyncFunction(
      { source: "", compiled: getDocumentIdsJs },
      [assistantDocumentsByCollection],
    );

    if (!result.success) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: result,
      };
    }

    const dataValidationResult = v.safeParse(
      v.record(
        v.pipe(
          v.string(),
          v.check((input) => Id.is.collection(input), "Must be a CollectionId"),
        ),
        v.array(
          v.pipe(
            v.string(),
            v.check((input) => Id.is.document(input), "Must be a DocumentId"),
          ),
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

    const documentIdsByCollection = dataValidationResult.output;
    const artifactsTables: Record<
      CollectionId,
      {
        documentsTableId: string;
        documents: LiteDocument[];
      }
    > = {};
    const outputTables: Record<
      CollectionId,
      {
        markdownSnippet: string;
        tableInfo: {
          columns: string[];
          rowCount: number;
        };
      }
    > = {};

    for (const collectionId of uniqueCollectionIds) {
      const documents = documentsByCollection[collectionId] ?? [];
      const documentIds = new Set(documentIdsByCollection[collectionId] ?? []);
      const filteredDocuments = documents
        .filter(({ id }) => documentIds.has(id))
        .map(makeLiteDocument);
      const documentsTableId = createMarkdownElementId();
      const tableColumns = ContentSummaryUtils.getSortedProperties(
        documents.map((document) => document.latestVersion.contentSummary),
      ).map(({ label }) => label);
      outputTables[collectionId] = {
        markdownSnippet: `<DocumentsTable id="${documentsTableId}" />`,
        tableInfo: {
          columns: tableColumns,
          rowCount: filteredDocuments.length,
        },
      };
      artifactsTables[collectionId] = {
        documentsTableId,
        documents: filteredDocuments,
      };
    }

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult(outputTables),
      artifacts: { tables: artifactsTables },
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.CreateDocumentsTables,
      description: `
Creates one or more inline document tables that you can use in your textual
responses by including verbatim the \`markdownSnippet\`s returned by the tool
call. Use this tool every time you want to show a set of documents to the user.
For showing documents, always use this tool instead of markdown tables.

This tool is a variant of ${ToolName.ExecuteTypescriptFunction}.

\`getDocumentIds\`:

- Takes the same parameters as the function in ${ToolName.ExecuteTypescriptFunction}
  (documents grouped by collection).
- Executes in the same environment.
- **Must** abide by ALL its rules.
- **Must** return a record of collection IDs to document IDs.

Call this tool directly. DO NOT chain it to an ${ToolName.ExecuteTypescriptFunction}
tool call.
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionIds: {
            type: "array",
            items: {
              type: "string",
            },
          },
          getDocumentIds: {
            description:
              "TypeScript function returning a record mapping collection IDs to arrays of document IDs. `export default function getDocumentIds(documentsByCollection: DocumentsByCollection): Record<string, string[]> {}`",
            type: "string",
          },
        },
        required: ["collectionIds", "getDocumentIds"],
        additionalProperties: false,
      },
    };
  },
};

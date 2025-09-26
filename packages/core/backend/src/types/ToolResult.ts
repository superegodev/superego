import type { Result, ResultError } from "@superego/global-types";
import type ToolName from "../enums/ToolName.js";
import type CollectionCategoryNotFound from "../errors/CollectionCategoryNotFound.js";
import type CollectionNotFound from "../errors/CollectionNotFound.js";
import type CollectionSchemaNotValid from "../errors/CollectionSchemaNotValid.js";
import type CollectionSettingsNotValid from "../errors/CollectionSettingsNotValid.js";
import type DocumentContentNotValid from "../errors/DocumentContentNotValid.js";
import type DocumentNotFound from "../errors/DocumentNotFound.js";
import type DocumentVersionIdNotMatching from "../errors/DocumentVersionIdNotMatching.js";
import type DocumentVersionNotFound from "../errors/DocumentVersionNotFound.js";
import type ExecutingJavascriptFunctionFailed from "../errors/ExecutingJavascriptFunctionFailed.js";
import type FilesNotFound from "../errors/FilesNotFound.js";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";
import type LiteDocument from "./LiteDocument.js";
import type ValidationIssue from "./ValidationIssue.js";

type BaseToolResult<
  Tool extends ToolName | string = string,
  Output extends Result<any, any> = Result<any, any>,
  Artifacts extends Record<string, any> | null = null,
> = { tool: Tool; toolCallId: string } & (
  | (Artifacts extends null
      ? {
          /** The output returned to the LLM. */
          output: Output & { success: true };
          artifacts?: null;
        }
      : {
          /** The output returned to the LLM. */
          output: Output & { success: true };
          /**
           * Artifacts produced during the processing of the tool call. These are not
           * returned to the LLM, but they remain attached to the tool result so they
           * can be accessed by the UI / other parts of Superego using tool results.
           */
          artifacts: Artifacts;
        })
  | {
      /** The output returned to the LLM. */
      output: Output & { success: false };
      artifacts?: never;
    }
);

// TODO: consider using specific errors, without reusing the API ones.
namespace ToolResult {
  // Factotum
  export type GetCollectionTypescriptSchema = BaseToolResult<
    ToolName.GetCollectionTypescriptSchema,
    Result<
      {
        typescriptSchema: string;
      },
      CollectionNotFound
    >
  >;
  export type CreateDocuments = BaseToolResult<
    ToolName.CreateDocuments,
    Result<
      {
        documents: {
          collectionId: CollectionId;
          documentId: DocumentId;
          documentVersionId: DocumentVersionId;
        }[];
      },
      CollectionNotFound | DocumentContentNotValid | FilesNotFound
    >,
    { documents: LiteDocument[] }
  >;
  export type CreateNewDocumentVersion = BaseToolResult<
    ToolName.CreateNewDocumentVersion,
    Result<
      {
        collectionId: CollectionId;
        documentId: DocumentId;
        documentVersionId: DocumentVersionId;
      },
      | CollectionNotFound
      | DocumentNotFound
      | DocumentVersionNotFound
      | DocumentVersionIdNotMatching
      | DocumentContentNotValid
      | FilesNotFound
    >,
    { document: LiteDocument }
  >;
  export type ExecuteJavascriptFunction = BaseToolResult<
    ToolName.ExecuteJavascriptFunction,
    Result<any, CollectionNotFound | ExecutingJavascriptFunctionFailed>
  >;
  export type CreateChart = BaseToolResult<
    ToolName.CreateChart,
    Result<
      {
        markdownSnippet: string;
        chartInfo: {
          seriesColorOrder: string[];
        };
      },
      | CollectionNotFound
      | ExecutingJavascriptFunctionFailed
      | ResultError<"EchartsOptionNotValid", { issues: ValidationIssue[] }>
    >,
    {
      chartId: string;
      echartsOption: {
        title: { text: string } | [{ text: string }, ...any[]];
      };
    }
  >;
  export type CreateDocumentsTable = BaseToolResult<
    ToolName.CreateDocumentsTable,
    Result<
      {
        markdownSnippet: string;
        tableInfo: {
          columns: string[];
          rowCount: number;
        };
      },
      | CollectionNotFound
      | ExecutingJavascriptFunctionFailed
      | ResultError<"ReturnValueNotValid", { issues: ValidationIssue[] }>
    >,
    {
      documentsTableId: string;
      documents: LiteDocument[];
    }
  >;

  // CollectionCreator
  export type SuggestCollectionDefinition = BaseToolResult<
    ToolName.SuggestCollectionDefinition,
    Result<
      null,
      | CollectionCategoryNotFound
      | CollectionSchemaNotValid
      | CollectionSettingsNotValid
      | ResultError<"TableColumnsNotValid", { issues: ValidationIssue[] }>
      | ResultError<"ExampleDocumentNotValid", { issues: ValidationIssue[] }>
    >
  >;

  // Shared
  export type Unknown = BaseToolResult<
    string,
    Result<null, ResultError<"ToolNotFound", null>>
  >;
}

type ToolResult =
  | ToolResult.CreateDocuments
  | ToolResult.CreateNewDocumentVersion
  | ToolResult.ExecuteJavascriptFunction
  | ToolResult.GetCollectionTypescriptSchema
  | ToolResult.CreateChart
  | ToolResult.CreateDocumentsTable
  | ToolResult.SuggestCollectionDefinition
  | ToolResult.Unknown;

export default ToolResult;

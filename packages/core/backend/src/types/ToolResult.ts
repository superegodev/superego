import type { Result, ResultError } from "@superego/global-types";
import type ToolName from "../enums/ToolName.js";
import type CollectionCategoryNotFound from "../errors/CollectionCategoryNotFound.js";
import type CollectionNotFound from "../errors/CollectionNotFound.js";
import type CollectionSchemaNotValid from "../errors/CollectionSchemaNotValid.js";
import type CollectionSettingsNotValid from "../errors/CollectionSettingsNotValid.js";
import type ConnectorDoesNotSupportUpSyncing from "../errors/ConnectorDoesNotSupportUpSyncing.js";
import type DocumentContentNotValid from "../errors/DocumentContentNotValid.js";
import type DocumentNotFound from "../errors/DocumentNotFound.js";
import type DocumentVersionIdNotMatching from "../errors/DocumentVersionIdNotMatching.js";
import type ExecutingJavascriptFunctionFailed from "../errors/ExecutingJavascriptFunctionFailed.js";
import type FileNotFound from "../errors/FileNotFound.js";
import type FilesNotFound from "../errors/FilesNotFound.js";
import type ReferencedCollectionsNotFound from "../errors/ReferencedCollectionsNotFound.js";
import type ReferencedDocumentsNotFound from "../errors/ReferencedDocumentsNotFound.js";
import type TypescriptCompilationFailed from "../errors/TypescriptCompilationFailed.js";
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
      | CollectionNotFound
      | ConnectorDoesNotSupportUpSyncing
      | DocumentContentNotValid
      | FilesNotFound
      | ReferencedDocumentsNotFound
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
      | ConnectorDoesNotSupportUpSyncing
      | DocumentVersionIdNotMatching
      | DocumentContentNotValid
      | FilesNotFound
      | ReferencedDocumentsNotFound
    >,
    { document: LiteDocument }
  >;
  export type ExecuteTypescriptFunction = BaseToolResult<
    ToolName.ExecuteTypescriptFunction,
    Result<
      any,
      | CollectionNotFound
      | TypescriptCompilationFailed
      | ExecutingJavascriptFunctionFailed
    >
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
      | TypescriptCompilationFailed
      | ExecutingJavascriptFunctionFailed
      | ResultError<"EChartsOptionNotValid", { issues: ValidationIssue[] }>
    >,
    {
      chartId: string;
      echartsOption: {
        title: { text: string } | [{ text: string }, ...any[]];
      };
    }
  >;
  export type CreateDocumentsTables = BaseToolResult<
    ToolName.CreateDocumentsTables,
    Result<
      Record<
        CollectionId,
        {
          markdownSnippet: string;
          tableInfo: {
            columns: string[];
            rowCount: number;
          };
        }
      >,
      | CollectionNotFound
      | TypescriptCompilationFailed
      | ExecutingJavascriptFunctionFailed
      | ResultError<"ReturnValueNotValid", { issues: ValidationIssue[] }>
    >,
    {
      tables: Record<
        CollectionId,
        {
          documentsTableId: string;
          documents: LiteDocument[];
        }
      >;
    }
  >;
  export type SearchDocuments = BaseToolResult<
    ToolName.SearchDocuments,
    Result<
      {
        documents: {
          collectionId: CollectionId;
          id: DocumentId;
          versionId: DocumentVersionId;
          content: any;
        }[];
      },
      CollectionNotFound
    >
  >;

  // CollectionCreator
  export type SuggestCollectionDefinition = BaseToolResult<
    ToolName.SuggestCollectionDefinition,
    Result<
      null,
      | CollectionCategoryNotFound
      | CollectionSchemaNotValid
      | ReferencedCollectionsNotFound
      | CollectionSettingsNotValid
      | ResultError<"TableColumnsNotValid", { issues: ValidationIssue[] }>
      | ResultError<"ExampleDocumentNotValid", { issues: ValidationIssue[] }>
    >
  >;

  // Shared
  export type InspectFile = BaseToolResult<
    ToolName.InspectFile,
    Result<{ fileInfo: string }, FileNotFound>
  >;
  export type Unknown = BaseToolResult<
    string,
    Result<null, ResultError<"ToolNotFound", null>>
  >;

  // Other tools, not used by an assistant
  export type WriteTypescriptModule = BaseToolResult<
    ToolName.WriteTypescriptModule,
    Result<null, TypescriptCompilationFailed>
  >;
}

type ToolResult =
  | ToolResult.CreateDocuments
  | ToolResult.CreateNewDocumentVersion
  | ToolResult.ExecuteTypescriptFunction
  | ToolResult.GetCollectionTypescriptSchema
  | ToolResult.CreateChart
  | ToolResult.CreateDocumentsTables
  | ToolResult.SearchDocuments
  | ToolResult.SuggestCollectionDefinition
  | ToolResult.InspectFile
  | ToolResult.Unknown
  | ToolResult.WriteTypescriptModule;

export default ToolResult;

import type { Result, ResultError } from "@superego/global-types";
import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import ToolName from "../enums/ToolName.js";
import CollectionCategoryNotFoundSchema from "../errors/CollectionCategoryNotFound.js";
import type { CollectionCategoryNotFound } from "../errors/CollectionCategoryNotFound.js";
import CollectionNotFoundSchema from "../errors/CollectionNotFound.js";
import type { CollectionNotFound } from "../errors/CollectionNotFound.js";
import CollectionSchemaNotValidSchema from "../errors/CollectionSchemaNotValid.js";
import type { CollectionSchemaNotValid } from "../errors/CollectionSchemaNotValid.js";
import CollectionSettingsNotValidSchema from "../errors/CollectionSettingsNotValid.js";
import type { CollectionSettingsNotValid } from "../errors/CollectionSettingsNotValid.js";
import ConnectorDoesNotSupportUpSyncingSchema from "../errors/ConnectorDoesNotSupportUpSyncing.js";
import type { ConnectorDoesNotSupportUpSyncing } from "../errors/ConnectorDoesNotSupportUpSyncing.js";
import DocumentContentNotValidSchema from "../errors/DocumentContentNotValid.js";
import type { DocumentContentNotValid } from "../errors/DocumentContentNotValid.js";
import DocumentNotFoundSchema from "../errors/DocumentNotFound.js";
import type { DocumentNotFound } from "../errors/DocumentNotFound.js";
import DocumentVersionIdNotMatchingSchema from "../errors/DocumentVersionIdNotMatching.js";
import type { DocumentVersionIdNotMatching } from "../errors/DocumentVersionIdNotMatching.js";
import DuplicateDocumentDetectedSchema from "../errors/DuplicateDocumentDetected.js";
import type { DuplicateDocumentDetected } from "../errors/DuplicateDocumentDetected.js";
import ExecutingJavascriptFunctionFailedSchema from "../errors/ExecutingJavascriptFunctionFailed.js";
import type { ExecutingJavascriptFunctionFailed } from "../errors/ExecutingJavascriptFunctionFailed.js";
import FileNotFoundSchema from "../errors/FileNotFound.js";
import type { FileNotFound } from "../errors/FileNotFound.js";
import FilesNotFoundSchema from "../errors/FilesNotFound.js";
import type { FilesNotFound } from "../errors/FilesNotFound.js";
import MakingContentBlockingKeysFailedSchema from "../errors/MakingContentBlockingKeysFailed.js";
import type { MakingContentBlockingKeysFailed } from "../errors/MakingContentBlockingKeysFailed.js";
import ReferencedCollectionsNotFoundSchema from "../errors/ReferencedCollectionsNotFound.js";
import type { ReferencedCollectionsNotFound } from "../errors/ReferencedCollectionsNotFound.js";
import ReferencedDocumentsNotFoundSchema from "../errors/ReferencedDocumentsNotFound.js";
import type { ReferencedDocumentsNotFound } from "../errors/ReferencedDocumentsNotFound.js";
import TypescriptCompilationFailedSchema from "../errors/TypescriptCompilationFailed.js";
import type { TypescriptCompilationFailed } from "../errors/TypescriptCompilationFailed.js";
import type { CollectionId } from "../ids/CollectionId.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import type { DocumentId } from "../ids/DocumentId.js";
import DocumentIdSchema from "../ids/DocumentId.js";
import type { DocumentVersionId } from "../ids/DocumentVersionId.js";
import DocumentVersionIdSchema from "../ids/DocumentVersionId.js";
import type { LiteDocument } from "./LiteDocument.js";
import LiteDocumentSchema from "./LiteDocument.js";
import type { TypescriptModule } from "./TypescriptModule.js";
import TypescriptModuleSchema from "./TypescriptModule.js";
import type { ValidationIssue } from "./ValidationIssue.js";
import ValidationIssueSchema from "./ValidationIssue.js";

const echartsOptionNotValidSchema = defineError(
  "EChartsOptionNotValid",
  v.object({ issues: v.array(ValidationIssueSchema) }),
);
const geoJSONNotValidSchema = defineError(
  "GeoJSONNotValid",
  v.object({ issues: v.array(ValidationIssueSchema) }),
);
const returnValueNotValidSchema = defineError(
  "ReturnValueNotValid",
  v.object({ issues: v.array(ValidationIssueSchema) }),
);
const exampleDocumentNotValidSchema = defineError(
  "ExampleDocumentNotValid",
  v.object({ issues: v.array(ValidationIssueSchema) }),
);
const toolNotFoundSchema = defineError("ToolNotFound", v.null());

function makeToolResultVariant<
  ToolLiteral extends ToolName | string,
  DataSchema extends v.GenericSchema,
  ErrorSchema extends v.GenericSchema,
>(
  toolName: ToolLiteral,
  dataSchema: DataSchema,
  errorSchema: ErrorSchema,
  artifactsSchema?: v.GenericSchema,
) {
  const successWithArtifacts = artifactsSchema
    ? v.object({
        tool: v.literal(toolName),
        toolCallId: v.string(),
        output: v.object({
          success: v.literal(true),
          data: dataSchema,
          error: v.null(),
        }),
        artifacts: artifactsSchema,
      })
    : v.object({
        tool: v.literal(toolName),
        toolCallId: v.string(),
        output: v.object({
          success: v.literal(true),
          data: dataSchema,
          error: v.null(),
        }),
        artifacts: v.optional(v.null()),
      });
  const failure = v.object({
    tool: v.literal(toolName),
    toolCallId: v.string(),
    output: v.object({
      success: v.literal(false),
      data: v.null(),
      error: errorSchema,
    }),
    artifacts: v.optional(v.never()),
  });
  return v.union([successWithArtifacts, failure]);
}

const getCollectionTypescriptSchemaResult = makeToolResultVariant(
  ToolName.GetCollectionTypescriptSchema,
  v.object({ typescriptSchema: v.string() }),
  CollectionNotFoundSchema,
);

const createDocumentsResult = makeToolResultVariant(
  ToolName.CreateDocuments,
  v.object({
    documents: v.array(
      v.object({
        collectionId: CollectionIdSchema,
        documentId: DocumentIdSchema,
        documentVersionId: DocumentVersionIdSchema,
      }),
    ),
  }),
  v.union([
    CollectionNotFoundSchema,
    ConnectorDoesNotSupportUpSyncingSchema,
    DocumentContentNotValidSchema,
    FilesNotFoundSchema,
    ReferencedDocumentsNotFoundSchema,
    MakingContentBlockingKeysFailedSchema,
    DuplicateDocumentDetectedSchema,
  ]),
  v.object({ documents: v.array(LiteDocumentSchema) }),
);

const createNewDocumentVersionResult = makeToolResultVariant(
  ToolName.CreateNewDocumentVersion,
  v.object({
    collectionId: CollectionIdSchema,
    documentId: DocumentIdSchema,
    documentVersionId: DocumentVersionIdSchema,
  }),
  v.union([
    CollectionNotFoundSchema,
    DocumentNotFoundSchema,
    ConnectorDoesNotSupportUpSyncingSchema,
    DocumentVersionIdNotMatchingSchema,
    DocumentContentNotValidSchema,
    FilesNotFoundSchema,
    ReferencedDocumentsNotFoundSchema,
    MakingContentBlockingKeysFailedSchema,
  ]),
  v.object({ document: LiteDocumentSchema }),
);

const executeTypescriptFunctionResult = makeToolResultVariant(
  ToolName.ExecuteTypescriptFunction,
  v.any(),
  v.union([
    CollectionNotFoundSchema,
    TypescriptCompilationFailedSchema,
    ExecutingJavascriptFunctionFailedSchema,
  ]),
);

const createChartResult = makeToolResultVariant(
  ToolName.CreateChart,
  v.object({
    markdownSnippet: v.string(),
    chartInfo: v.object({ seriesColorOrder: v.array(v.string()) }),
  }),
  v.union([
    CollectionNotFoundSchema,
    TypescriptCompilationFailedSchema,
    ExecutingJavascriptFunctionFailedSchema,
    echartsOptionNotValidSchema,
  ]),
  v.object({
    chartId: v.string(),
    echartsOption: v.object({ title: v.any() }),
  }),
);

const createGeoJSONMapResult = makeToolResultVariant(
  ToolName.CreateGeoJSONMap,
  v.object({ markdownSnippet: v.string() }),
  v.union([
    CollectionNotFoundSchema,
    TypescriptCompilationFailedSchema,
    ExecutingJavascriptFunctionFailedSchema,
    geoJSONNotValidSchema,
  ]),
  v.object({
    geoJSONMapId: v.string(),
    geoJSON: v.object({ type: v.string() }),
  }),
);

const createDocumentsTablesResult = makeToolResultVariant(
  ToolName.CreateDocumentsTables,
  v.record(
    v.string(),
    v.object({
      markdownSnippet: v.string(),
      tableInfo: v.object({
        columns: v.array(v.string()),
        rowCount: v.number(),
      }),
    }),
  ),
  v.union([
    CollectionNotFoundSchema,
    TypescriptCompilationFailedSchema,
    ExecutingJavascriptFunctionFailedSchema,
    returnValueNotValidSchema,
  ]),
  v.object({
    tables: v.record(
      v.string(),
      v.object({
        documentsTableId: v.string(),
        documents: v.array(LiteDocumentSchema),
      }),
    ),
  }),
);

const searchDocumentsResult = makeToolResultVariant(
  ToolName.SearchDocuments,
  v.object({
    results: v.array(
      v.object({
        documents: v.array(
          v.object({
            collectionId: CollectionIdSchema,
            id: DocumentIdSchema,
            versionId: DocumentVersionIdSchema,
            content: v.any(),
          }),
        ),
      }),
    ),
  }),
  CollectionNotFoundSchema,
);

const suggestCollectionsDefinitionsResult = makeToolResultVariant(
  ToolName.SuggestCollectionsDefinitions,
  v.null(),
  v.union([
    CollectionCategoryNotFoundSchema,
    CollectionSchemaNotValidSchema,
    ReferencedCollectionsNotFoundSchema,
    CollectionSettingsNotValidSchema,
    exampleDocumentNotValidSchema,
  ]),
  v.object({
    collections: v.array(
      v.object({
        contentBlockingKeysGetter: v.nullable(TypescriptModuleSchema),
        contentSummaryGetter: TypescriptModuleSchema,
      }),
    ),
  }),
);

const inspectFileResult = makeToolResultVariant(
  ToolName.InspectFile,
  v.object({ fileInfo: v.string() }),
  FileNotFoundSchema,
);

const writeTypescriptModuleResult = makeToolResultVariant(
  ToolName.WriteTypescriptModule,
  v.null(),
  TypescriptCompilationFailedSchema,
);

const unknownResult = v.object({
  tool: v.string(),
  toolCallId: v.string(),
  output: v.object({
    success: v.literal(false),
    data: v.null(),
    error: toolNotFoundSchema,
  }),
  artifacts: v.optional(v.never()),
});

type BaseToolResult<
  Tool extends ToolName | string = string,
  Output extends Result<any, any> = Result<any, any>,
  Artifacts extends Record<string, any> | null = null,
> = { tool: Tool; toolCallId: string } & (
  | (Artifacts extends null
      ? {
          output: Output & { success: true };
          artifacts?: null;
        }
      : {
          output: Output & { success: true };
          artifacts: Artifacts;
        })
  | {
      output: Output & { success: false };
      artifacts?: never;
    }
);

namespace ToolResult {
  export type GetCollectionTypescriptSchema = BaseToolResult<
    ToolName.GetCollectionTypescriptSchema,
    Result<{ typescriptSchema: string }, CollectionNotFound>
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
      | MakingContentBlockingKeysFailed
      | DuplicateDocumentDetected
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
      | MakingContentBlockingKeysFailed
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
        chartInfo: { seriesColorOrder: string[] };
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
  export type CreateGeoJSONMap = BaseToolResult<
    ToolName.CreateGeoJSONMap,
    Result<
      { markdownSnippet: string },
      | CollectionNotFound
      | TypescriptCompilationFailed
      | ExecutingJavascriptFunctionFailed
      | ResultError<"GeoJSONNotValid", { issues: ValidationIssue[] }>
    >,
    {
      geoJSONMapId: string;
      geoJSON: { type: string; [key: string]: unknown };
    }
  >;
  export type CreateDocumentsTables = BaseToolResult<
    ToolName.CreateDocumentsTables,
    Result<
      Record<
        CollectionId,
        {
          markdownSnippet: string;
          tableInfo: { columns: string[]; rowCount: number };
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
        { documentsTableId: string; documents: LiteDocument[] }
      >;
    }
  >;
  export type SearchDocuments = BaseToolResult<
    ToolName.SearchDocuments,
    Result<
      {
        results: {
          documents: {
            collectionId: CollectionId;
            id: DocumentId;
            versionId: DocumentVersionId;
            content: any;
          }[];
        }[];
      },
      CollectionNotFound
    >
  >;
  export type SuggestCollectionsDefinitions = BaseToolResult<
    ToolName.SuggestCollectionsDefinitions,
    Result<
      null,
      | CollectionCategoryNotFound
      | CollectionSchemaNotValid
      | ReferencedCollectionsNotFound
      | CollectionSettingsNotValid
      | ResultError<"ExampleDocumentNotValid", { issues: ValidationIssue[] }>
    >,
    {
      collections: {
        contentBlockingKeysGetter: TypescriptModule | null;
        contentSummaryGetter: TypescriptModule;
      }[];
    }
  >;
  export type InspectFile = BaseToolResult<
    ToolName.InspectFile,
    Result<{ fileInfo: string }, FileNotFound>
  >;
  export type Unknown = BaseToolResult<
    string,
    Result<null, ResultError<"ToolNotFound", null>>
  >;
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
  | ToolResult.CreateGeoJSONMap
  | ToolResult.CreateDocumentsTables
  | ToolResult.SearchDocuments
  | ToolResult.SuggestCollectionsDefinitions
  | ToolResult.InspectFile
  | ToolResult.Unknown
  | ToolResult.WriteTypescriptModule;

const ToolResultSchema: v.GenericSchema<ToolResult> = v.union([
  createDocumentsResult,
  createNewDocumentVersionResult,
  executeTypescriptFunctionResult,
  getCollectionTypescriptSchemaResult,
  createChartResult,
  createGeoJSONMapResult,
  createDocumentsTablesResult,
  searchDocumentsResult,
  suggestCollectionsDefinitionsResult,
  inspectFileResult,
  unknownResult,
  writeTypescriptModuleResult,
]) as v.GenericSchema<ToolResult>;
export default ToolResultSchema;
export type { ToolResult };

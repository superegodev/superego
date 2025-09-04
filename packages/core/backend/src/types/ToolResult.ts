import type { Result } from "@superego/global-types";
import type ToolName from "../enums/ToolName.js";
import type CollectionNotFound from "../errors/CollectionNotFound.js";
import type DocumentContentNotValid from "../errors/DocumentContentNotValid.js";
import type DocumentNotFound from "../errors/DocumentNotFound.js";
import type DocumentVersionIdNotMatching from "../errors/DocumentVersionIdNotMatching.js";
import type ExecutingJavascriptFunctionFailed from "../errors/ExecutingJavascriptFunctionFailed.js";
import type FilesNotFound from "../errors/FilesNotFound.js";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";

interface ToolResult<
  Tool extends ToolName | string = string,
  Output extends Result<any, any> = Result<any, any>,
> {
  tool: Tool;
  toolCallId: string;
  output: Output;
}

namespace ToolResult {
  export type GetCollectionTypescriptSchema = ToolResult<
    ToolName.GetCollectionTypescriptSchema,
    Result<
      {
        typescriptSchema: string;
      },
      CollectionNotFound
    >
  >;

  export type CreateDocument = ToolResult<
    ToolName.CreateDocument,
    Result<
      {
        collectionId: CollectionId;
        documentId: DocumentId;
        documentVersionId: DocumentVersionId;
      },
      CollectionNotFound | DocumentContentNotValid | FilesNotFound
    >
  >;

  export type CreateNewDocumentVersion = ToolResult<
    ToolName.CreateNewDocumentVersion,
    Result<
      {
        collectionId: CollectionId;
        documentId: DocumentId;
        documentVersionId: DocumentVersionId;
      },
      | DocumentNotFound
      | DocumentVersionIdNotMatching
      | DocumentContentNotValid
      | FilesNotFound
    >
  >;

  export type ExecuteJavascriptFunction = ToolResult<
    ToolName.ExecuteJavascriptFunction,
    Result<any, CollectionNotFound | ExecutingJavascriptFunctionFailed>
  >;
}

export default ToolResult;

import type CollectionNotFound from "../errors/CollectionNotFound.js";
import type DocumentContentNotValid from "../errors/DocumentContentNotValid.js";
import type FilesNotFound from "../errors/FilesNotFound.js";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";
import type Tool from "./Tool.js";
import type ToolResultOutput from "./ToolResultOutput.js";

interface ToolResult<
  TTool extends Tool | string = string,
  Output extends ToolResultOutput<any, any> = ToolResultOutput<any, any>,
> {
  tool: TTool;
  toolCallId: string;
  output: Output;
}

namespace ToolResult {
  export type GetCollectionTypescriptSchema = ToolResult<
    Tool.GetCollectionTypescriptSchema,
    ToolResultOutput<
      {
        typescriptSchema: string;
      },
      CollectionNotFound
    >
  >;

  export type CreateDocumentForCollection = ToolResult<
    Tool.CreateDocumentForCollection,
    ToolResultOutput<
      {
        collectionId: CollectionId;
        documentId: DocumentId;
        documentVersionId: DocumentVersionId;
      },
      CollectionNotFound | DocumentContentNotValid | FilesNotFound
    >
  >;
}

export default ToolResult;

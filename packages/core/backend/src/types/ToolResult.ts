import type CollectionNotFound from "../errors/CollectionNotFound.js";
import type DocumentContentNotValid from "../errors/DocumentContentNotValid.js";
import type FilesNotFound from "../errors/FilesNotFound.js";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";
import type ToolName from "./ToolName.js";
import type ToolResultOutput from "./ToolResultOutput.js";

interface ToolResult<
  Tool extends ToolName | string = string,
  Output extends ToolResultOutput<any, any> = ToolResultOutput<any, any>,
> {
  tool: Tool;
  toolCallId: string;
  output: Output;
}

namespace ToolResult {
  export type GetCollectionTypescriptSchema = ToolResult<
    ToolName.GetCollectionTypescriptSchema,
    ToolResultOutput<
      {
        typescriptSchema: string;
      },
      CollectionNotFound
    >
  >;

  export type CreateDocumentForCollection = ToolResult<
    ToolName.CreateDocumentForCollection,
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

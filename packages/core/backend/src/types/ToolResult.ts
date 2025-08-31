import type { Result } from "@superego/global-types";
import type CollectionNotFound from "../errors/CollectionNotFound.js";
import type DocumentContentNotValid from "../errors/DocumentContentNotValid.js";
import type FilesNotFound from "../errors/FilesNotFound.js";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";
import type ToolName from "./ToolName.js";

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

  export type CreateDocumentForCollection = ToolResult<
    ToolName.CreateDocumentForCollection,
    Result<
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

import type ToolName from "../enums/ToolName.js";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";

interface ToolCall<Tool extends ToolName | string = string, Input = any> {
  id: string;
  tool: Tool;
  input: Input;
}

namespace ToolCall {
  export type GetCollectionTypescriptSchema = ToolCall<
    ToolName.GetCollectionTypescriptSchema,
    {
      collectionId: CollectionId;
    }
  >;

  export type CreateDocument = ToolCall<
    ToolName.CreateDocument,
    {
      collectionId: CollectionId;
      content: any;
    }
  >;

  export type CreateNewDocumentVersion = ToolCall<
    ToolName.CreateNewDocumentVersion,
    {
      collectionId: CollectionId;
      id: DocumentId;
      latestVersionId: DocumentVersionId;
      content: any;
    }
  >;

  export type ExecuteJavascriptFunction = ToolCall<
    ToolName.ExecuteJavascriptFunction,
    {
      collectionId: CollectionId;
      javascriptFunction: string;
    }
  >;
}

export default ToolCall;

import type CollectionId from "../ids/CollectionId.js";
import type ToolName from "./ToolName.js";

interface ToolCall<Tool extends ToolName | string = string, Input = any> {
  id: string;
  tool: Tool;
  input: Input;
}

namespace ToolCall {
  export type CompleteConversation = ToolCall<
    ToolName.CompleteConversation,
    { finalMessage: string }
  >;

  export type GetCollectionTypescriptSchema = ToolCall<
    ToolName.GetCollectionTypescriptSchema,
    { collectionId: CollectionId }
  >;

  export type CreateDocumentForCollection = ToolCall<
    ToolName.CreateDocumentForCollection,
    any
  >;
}

export default ToolCall;

import type CollectionId from "../ids/CollectionId.js";
import type Tool from "./Tool.js";

interface ToolCall<TTool extends Tool | string = string, Input = any> {
  id: string;
  tool: TTool;
  input: Input;
}

namespace ToolCall {
  export type CompleteConversation = ToolCall<
    Tool.CompleteConversation,
    { finalMessage: string }
  >;

  export type GetCollectionTypescriptSchema = ToolCall<
    Tool.GetCollectionTypescriptSchema,
    { collectionId: CollectionId }
  >;

  export type CreateDocumentForCollection = ToolCall<
    Tool.CreateDocumentForCollection,
    any
  >;
}

export default ToolCall;

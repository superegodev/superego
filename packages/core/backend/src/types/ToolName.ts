import type CollectionId from "../ids/CollectionId.js";

namespace ToolName {
  export type GetCollectionTypescriptSchema =
    "get_collection_typescript_schema";

  export type CreateDocumentForCollection = `${CollectionId}.create_document`;

  export type CompleteConversation = "complete_conversation";
}

type ToolName =
  | ToolName.GetCollectionTypescriptSchema
  | ToolName.CreateDocumentForCollection
  | ToolName.CompleteConversation;

export default ToolName;

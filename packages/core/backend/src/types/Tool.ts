import type CollectionId from "../ids/CollectionId.js";

namespace Tool {
  export type GetCollectionTypescriptSchema =
    "get_collection_typescript_schema";

  export type CreateDocumentForCollection =
    `create_document_for_${CollectionId}`;

  export type CompleteConversation = "complete_conversation";
}

type Tool =
  | Tool.GetCollectionTypescriptSchema
  | Tool.CreateDocumentForCollection
  | Tool.CompleteConversation;

export default Tool;

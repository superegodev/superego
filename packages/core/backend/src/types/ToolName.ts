import type CollectionId from "../ids/CollectionId.js";

namespace ToolName {
  export type GetCollectionTypescriptSchema = "getCollectionTypescriptSchema";

  export type CreateDocumentForCollection = `${CollectionId}.createDocument`;

  export type CompleteConversation = "completeConversation";
}

type ToolName =
  | ToolName.GetCollectionTypescriptSchema
  | ToolName.CreateDocumentForCollection
  | ToolName.CompleteConversation;

export default ToolName;

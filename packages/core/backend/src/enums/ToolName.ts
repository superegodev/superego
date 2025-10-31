enum ToolName {
  // Factotum
  CreateDocuments = "createDocuments",
  CreateNewDocumentVersion = "createNewDocumentVersion",
  ExecuteTypescriptFunction = "executeTypescriptFunction",
  GetCollectionTypescriptSchema = "getCollectionTypescriptSchema",
  CreateChart = "createChart",
  CreateDocumentsTable = "createDocumentsTable",
  // CollectionCreator
  SuggestCollectionDefinition = "suggestCollectionDefinition",
  // Other tools, not used by an assistant
  WriteTypescriptModule = "writeTypescriptModule",
}
export default ToolName;

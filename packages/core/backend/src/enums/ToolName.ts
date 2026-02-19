enum ToolName {
  // Factotum
  CreateDocuments = "createDocuments",
  CreateNewDocumentVersion = "createNewDocumentVersion",
  ExecuteTypescriptFunction = "executeTypescriptFunction",
  GetCollectionTypescriptSchema = "getCollectionTypescriptSchema",
  CreateChart = "createChart",
  CreateGeoJSONMap = "createGeoJSONMap",
  CreateDocumentsTables = "createDocumentsTables",
  SearchDocuments = "searchDocuments",
  // CollectionCreator
  SuggestCollectionsDefinitions = "suggestCollectionsDefinitions",
  // Shared
  InspectFile = "inspectFile",
  // Other tools, not used by an assistant
  WriteTypescriptModule = "writeTypescriptModule",
}
export default ToolName;

import { DocumentsGetVersion } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";

export default createBackendCommand({
  name: "get-version",
  description: "Get a document version.",
  UsecaseClass: DocumentsGetVersion,
  getCall: (backend) => backend.documents.getVersion,
  arguments: [
    { name: "collection-id", description: "Collection id" },
    { name: "id", description: "Document id" },
    { name: "version-id", description: "Document version id" },
  ],
});

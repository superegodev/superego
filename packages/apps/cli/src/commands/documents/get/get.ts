import { DocumentsGet } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";

export default createBackendCommand({
  name: "get",
  description: "Get a document.",
  UsecaseClass: DocumentsGet,
  getCall: (backend) => backend.documents.get,
  arguments: [
    { name: "collection-id", description: "Collection id" },
    { name: "id", description: "Document id" },
  ],
});

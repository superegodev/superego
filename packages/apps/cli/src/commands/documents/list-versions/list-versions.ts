import { DocumentsListVersions } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";

export default createBackendCommand({
  name: "list-versions",
  description: "List document versions.",
  UsecaseClass: DocumentsListVersions,
  getCall: (backend) => backend.documents.listVersions,
  arguments: [
    { name: "collection-id", description: "Collection id" },
    { name: "id", description: "Document id" },
  ],
});

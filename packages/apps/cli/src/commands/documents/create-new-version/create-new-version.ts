import { DocumentsCreateNewVersion } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import help from "./help.md?raw";

export default createBackendCommand({
  name: "create-new-version",
  description: "Replace document content by creating a new document version.",
  UsecaseClass: DocumentsCreateNewVersion,
  getCall: (backend) => backend.documents.createNewVersion,
  arguments: [
    { name: "collection-id", description: "Collection id" },
    { name: "id", description: "Document id" },
    { name: "latest-version-id", description: "Latest document version id" },
    { name: "content", description: "Document content" },
  ],
  help,
});

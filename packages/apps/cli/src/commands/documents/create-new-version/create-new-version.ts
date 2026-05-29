import { DocumentsCreateNewVersion } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import additionalNotes from "./additional-notes.md?raw";

export default createBackendCommand({
  name: "create-new-version",
  description: "Replace document content by creating a new document version.",
  UsecaseClass: DocumentsCreateNewVersion,
  getCall: (backend) => backend.documents.createNewVersion,
  arguments: [
    { name: "collection-id", description: "Collection id" },
    { name: "id", description: "Document id" },
    { name: "latest-version-id", description: "Latest document version id" },
    { name: "input", description: "Document version input" },
  ],
  additionalNotes,
});

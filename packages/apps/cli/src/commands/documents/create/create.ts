import { DocumentsCreate } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import help from "./help.md?raw";

export default createBackendCommand({
  name: "create",
  description: "Create a document whose content matches its collection schema.",
  UsecaseClass: DocumentsCreate,
  getCall: (backend) => backend.documents.create,
  arguments: [{ name: "definition", description: "Document definition" }],
  help,
});

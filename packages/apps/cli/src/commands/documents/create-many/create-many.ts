import { DocumentsCreateMany } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";
import help from "./help.md?raw";

export default createBackendCommand({
  name: "create-many",
  description: "Create multiple documents.",
  UsecaseClass: DocumentsCreateMany,
  getCall: (backend) => backend.documents.createMany,
  arguments: [
    { name: "definitions", description: "Document definitions array" },
  ],
  help,
});

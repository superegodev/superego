import { DocumentsCreateMany } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import additionalNotes from "./additional-notes.md?raw";

export default createBackendCommand({
  name: "create-many",
  description: "Create multiple schema-valid documents.",
  UsecaseClass: DocumentsCreateMany,
  getCall: (backend) => backend.documents.createMany,
  arguments: [
    { name: "definitions", description: "Document definitions array" },
  ],
  additionalNotes,
});

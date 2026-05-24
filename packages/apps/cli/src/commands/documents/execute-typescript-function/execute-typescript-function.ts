import { DocumentsExecuteTypescriptFunction } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import additionalNotes from "./additional-notes.md?raw";

export default createBackendCommand({
  name: "execute-typescript-function",
  description:
    "Run a synchronous TypeScript function over collection documents.",
  UsecaseClass: DocumentsExecuteTypescriptFunction,
  getCall: (backend) => backend.documents.executeTypescriptFunction,
  arguments: [
    { name: "collection-ids", description: "Collection ids array" },
    { name: "typescript-function", description: "TypeScript function source" },
  ],
  additionalNotes,
});

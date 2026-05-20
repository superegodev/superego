import { DocumentsDelete } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";

export default createBackendCommand({
  name: "delete",
  description: "Delete a document.",
  UsecaseClass: DocumentsDelete,
  getCall: (backend) => backend.documents.delete,
  arguments: [
    { name: "collection-id", description: "Collection id" },
    { name: "id", description: "Document id" },
    {
      name: "command-confirmation",
      description: "Command confirmation",
      fixedValue: "delete",
    },
  ],
});

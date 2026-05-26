import { DocumentsList } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";

export default createBackendCommand({
  name: "list",
  description: "List documents in a collection.",
  UsecaseClass: DocumentsList,
  getCall: (backend) => backend.documents.list,
  arguments: [
    { name: "collection-id", description: "Collection id" },
    {
      name: "lite",
      description: "Pass false to include full document content",
      required: false,
    },
  ],
});

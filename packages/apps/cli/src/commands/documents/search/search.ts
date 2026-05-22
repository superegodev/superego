import { DocumentsSearch } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";

export default createBackendCommand({
  name: "search",
  description: "Full-text search documents by content summary.",
  UsecaseClass: DocumentsSearch,
  getCall: (backend) => backend.documents.search,
  arguments: [
    { name: "collection-id", description: "Collection id or null" },
    { name: "query", description: "Search query" },
    { name: "options", description: "Search options" },
  ],
});

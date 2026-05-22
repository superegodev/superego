import { CollectionsGetTypescriptSchema } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";

export default createBackendCommand({
  name: "get-typescript-schema",
  description: "Get TypeScript types for a collection's document content.",
  UsecaseClass: CollectionsGetTypescriptSchema,
  getCall: (backend) => backend.collections.getTypescriptSchema,
  arguments: [{ name: "collection-id", description: "Collection id" }],
});

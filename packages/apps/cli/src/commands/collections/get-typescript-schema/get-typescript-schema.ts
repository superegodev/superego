import { CollectionsGetTypescriptSchema } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";

export default createBackendCommand({
  name: "get-typescript-schema",
  description: "Get a collection TypeScript schema.",
  UsecaseClass: CollectionsGetTypescriptSchema,
  getCall: (backend) => backend.collections.getTypescriptSchema,
  arguments: [{ name: "collection-id", description: "Collection id" }],
});

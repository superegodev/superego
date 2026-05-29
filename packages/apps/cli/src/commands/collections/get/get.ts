import { CollectionsGet } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";

export default createBackendCommand({
  name: "get",
  description: "Get a collection.",
  UsecaseClass: CollectionsGet,
  getCall: (backend) => backend.collections.get,
  arguments: [{ name: "id", description: "Collection id" }],
});

import { CollectionsCreate } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";
import help from "./help.md?raw";

export default createBackendCommand({
  name: "create",
  description: "Create a collection.",
  UsecaseClass: CollectionsCreate,
  getCall: (backend) => backend.collections.create,
  arguments: [{ name: "definition", description: "Collection definition" }],
  help,
});

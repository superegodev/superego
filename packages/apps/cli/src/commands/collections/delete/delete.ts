import { CollectionsDelete } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";

export default createBackendCommand({
  name: "delete",
  description: "Delete a collection.",
  UsecaseClass: CollectionsDelete,
  getCall: (backend) => backend.collections.delete,
  arguments: [
    { name: "id", description: "Collection id" },
    {
      name: "command-confirmation",
      description: "Command confirmation",
      fixedValue: "delete",
    },
  ],
});

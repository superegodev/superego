import { CollectionsList } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";

export default createBackendCommand({
  name: "list",
  description: "List collections.",
  UsecaseClass: CollectionsList,
  getCall: (backend) => backend.collections.list,
});

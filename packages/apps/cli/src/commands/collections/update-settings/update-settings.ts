import { CollectionsUpdateSettings } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";

export default createBackendCommand({
  name: "update-settings",
  description: "Update collection settings.",
  UsecaseClass: CollectionsUpdateSettings,
  getCall: (backend) => backend.collections.updateSettings,
  arguments: [
    { name: "id", description: "Collection id" },
    { name: "settings-patch", description: "Collection settings patch" },
  ],
});

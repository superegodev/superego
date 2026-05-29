import { CollectionsUpdateSettings } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import { summarizeCollection } from "../../../utils/successSummaries.js";

export default createBackendCommand({
  name: "update-settings",
  description: "Update collection settings.",
  UsecaseClass: CollectionsUpdateSettings,
  getCall: (backend) => backend.collections.updateSettings,
  arguments: [
    { name: "id", description: "Collection id" },
    { name: "settings-patch", description: "Collection settings patch" },
  ],
  summarizeSuccessData: summarizeCollection,
});

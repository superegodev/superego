import { CollectionsUpdateLatestVersionSettings } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import help from "./help.md?raw";

export default createBackendCommand({
  name: "update-latest-version-settings",
  description: "Patch settings for the latest collection version.",
  UsecaseClass: CollectionsUpdateLatestVersionSettings,
  getCall: (backend) => backend.collections.updateLatestVersionSettings,
  arguments: [
    { name: "id", description: "Collection id" },
    { name: "latest-version-id", description: "Latest collection version id" },
    {
      name: "settings-patch",
      description: "Collection version settings patch",
    },
  ],
  help,
});

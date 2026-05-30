import { CollectionsUpdateLatestVersionSettings } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import { summarizeCollection } from "../../../utils/successSummaries.js";
import additionalNotes from "./additional-notes.md?raw";

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
  additionalNotes,
  summarizeSuccessData: summarizeCollection,
});

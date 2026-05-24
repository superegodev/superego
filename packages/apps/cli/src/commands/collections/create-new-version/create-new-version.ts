import { CollectionsCreateNewVersion } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import help from "./help.md?raw";

export default createBackendCommand({
  name: "create-new-version",
  description:
    "Create a new collection version with a new schema and settings.",
  UsecaseClass: CollectionsCreateNewVersion,
  getCall: (backend) => backend.collections.createNewVersion,
  arguments: [
    { name: "id", description: "Collection id" },
    { name: "latest-version-id", description: "Latest collection version id" },
    { name: "schema", description: "New Superego Schema" },
    { name: "settings", description: "Collection version settings" },
    { name: "migration", description: "Collection migration module or null" },
    {
      name: "remote-converters",
      description: "Remote converters",
      fixedValue: null,
    },
  ],
  help,
});

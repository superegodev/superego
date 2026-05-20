import { CollectionsCreateNewVersion } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";
import help from "./help.md?raw";

export default createBackendCommand({
  name: "create-new-version",
  description: "Create a new local collection version.",
  UsecaseClass: CollectionsCreateNewVersion,
  getCall: (backend) => backend.collections.createNewVersion,
  arguments: [
    { name: "id", description: "Collection id" },
    { name: "latest-version-id", description: "Latest collection version id" },
    { name: "schema", description: "Collection schema" },
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

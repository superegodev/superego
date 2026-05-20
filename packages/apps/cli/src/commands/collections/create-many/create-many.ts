import { CollectionsCreateMany } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";
import help from "./help.md?raw";

export default createBackendCommand({
  name: "create-many",
  description: "Create multiple collections.",
  UsecaseClass: CollectionsCreateMany,
  getCall: (backend) => backend.collections.createMany,
  arguments: [
    { name: "definitions", description: "Collection definitions array" },
  ],
  help,
});

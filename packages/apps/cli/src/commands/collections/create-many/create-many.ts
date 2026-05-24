import { CollectionsCreateMany } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import help from "./help.md?raw";

export default createBackendCommand({
  name: "create-many",
  description: "Create multiple collections and their initial schema versions.",
  UsecaseClass: CollectionsCreateMany,
  getCall: (backend) => backend.collections.createMany,
  arguments: [
    { name: "definitions", description: "Collection definitions array" },
  ],
  help,
});

import { CollectionsCreateMany } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import additionalNotes from "./additional-notes.md?raw";

export default createBackendCommand({
  name: "create-many",
  description: "Create multiple collections and their initial schema versions.",
  UsecaseClass: CollectionsCreateMany,
  getCall: (backend) => backend.collections.createMany,
  arguments: [
    { name: "definitions", description: "Collection definitions array" },
  ],
  additionalNotes,
});

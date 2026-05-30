import { CollectionsCreate } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import { summarizeCollection } from "../../../utils/successSummaries.js";
import additionalNotes from "./additional-notes.md?raw";

export default createBackendCommand({
  name: "create",
  description: "Create a collection and its initial schema version.",
  UsecaseClass: CollectionsCreate,
  getCall: (backend) => backend.collections.create,
  arguments: [{ name: "definition", description: "Collection definition" }],
  additionalNotes,
  summarizeSuccessData: summarizeCollection,
});

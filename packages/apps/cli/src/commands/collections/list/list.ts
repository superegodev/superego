import { CollectionsList } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import additionalNotes from "./additional-notes.md?raw";

export default createBackendCommand({
  name: "list",
  description: "List collections.",
  UsecaseClass: CollectionsList,
  getCall: (backend) => backend.collections.list,
  arguments: [
    {
      name: "lite",
      description: "Pass false to include full latest collection versions",
      required: false,
    },
  ],
  additionalNotes,
});

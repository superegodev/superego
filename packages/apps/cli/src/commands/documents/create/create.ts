import { DocumentsCreate } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";
import { summarizeDocument } from "../../../utils/successSummaries.js";
import additionalNotes from "./additional-notes.md?raw";

export default createBackendCommand({
  name: "create",
  description: "Create a document whose content matches its collection schema.",
  UsecaseClass: DocumentsCreate,
  getCall: (backend) => backend.documents.create,
  arguments: [{ name: "definition", description: "Document definition" }],
  additionalNotes,
  summarizeSuccessData: summarizeDocument,
});

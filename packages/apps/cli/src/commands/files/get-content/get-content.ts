import { FilesGetContent } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";

export default createBackendCommand({
  name: "get-content",
  description: "Get file content.",
  UsecaseClass: FilesGetContent,
  getCall: (backend) => backend.files.getContent,
  arguments: [{ name: "id", description: "File id" }],
});

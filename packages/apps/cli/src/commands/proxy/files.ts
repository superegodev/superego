import createProxyDomainCommand from "./createProxyDomainCommand.js";

const files = createProxyDomainCommand("files", "Manage files", [
  {
    name: "get-content",
    description: "Get file content",
    argumentCount: 1,
    getCall: (backend) => backend.files.getContent,
  },
]);

export default files;

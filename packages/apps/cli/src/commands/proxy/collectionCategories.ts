import createProxyDomainCommand from "./createProxyDomainCommand.js";

const collectionCategories = createProxyDomainCommand(
  "collection-categories",
  "Manage collection categories",
  [
    {
      name: "create",
      description: "Create a collection category",
      argumentCount: 1,
      getCall: (backend) => backend.collectionCategories.create,
    },
    {
      name: "update",
      description: "Update a collection category",
      argumentCount: 2,
      getCall: (backend) => backend.collectionCategories.update,
    },
    {
      name: "delete",
      description: "Delete a collection category",
      argumentCount: 1,
      getCall: (backend) => backend.collectionCategories.delete,
    },
    {
      name: "list",
      description: "List collection categories",
      argumentCount: 0,
      getCall: (backend) => backend.collectionCategories.list,
    },
  ],
);

export default collectionCategories;

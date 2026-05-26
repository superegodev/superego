import { CollectionCategoriesCreate } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";

export default createBackendCommand({
  name: "create",
  description: "Create a collection category.",
  UsecaseClass: CollectionCategoriesCreate,
  getCall: (backend) => backend.collectionCategories.create,
  arguments: [
    { name: "definition", description: "Collection category definition" },
  ],
});

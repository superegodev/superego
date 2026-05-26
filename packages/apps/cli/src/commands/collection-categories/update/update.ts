import { CollectionCategoriesUpdate } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";

export default createBackendCommand({
  name: "update",
  description: "Update a collection category.",
  UsecaseClass: CollectionCategoriesUpdate,
  getCall: (backend) => backend.collectionCategories.update,
  arguments: [
    { name: "id", description: "Collection category id" },
    { name: "patch", description: "Collection category patch" },
  ],
});

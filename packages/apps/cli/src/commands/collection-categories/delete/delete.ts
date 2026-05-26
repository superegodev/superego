import { CollectionCategoriesDelete } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";

export default createBackendCommand({
  name: "delete",
  description: "Delete a collection category.",
  UsecaseClass: CollectionCategoriesDelete,
  getCall: (backend) => backend.collectionCategories.delete,
  arguments: [{ name: "id", description: "Collection category id" }],
});

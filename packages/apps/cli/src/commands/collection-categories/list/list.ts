import { CollectionCategoriesList } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/backendCommand.js";

export default createBackendCommand({
  name: "list",
  description: "List collection categories.",
  UsecaseClass: CollectionCategoriesList,
  getCall: (backend) => backend.collectionCategories.list,
});

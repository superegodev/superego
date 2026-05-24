import { CollectionCategoriesList } from "@superego/executing-backend";
import createBackendCommand from "../../../utils/createBackendCommand.js";

export default createBackendCommand({
  name: "list",
  description: "List collection categories.",
  UsecaseClass: CollectionCategoriesList,
  getCall: (backend) => backend.collectionCategories.list,
});

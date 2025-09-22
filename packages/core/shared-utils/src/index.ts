import collectionCategoryName from "./valibot-schemas/collectionCategoryName.js";
import collectionName from "./valibot-schemas/collectionName.js";
import icon from "./valibot-schemas/icon.js";
import id from "./valibot-schemas/id.js";

export { default as Id } from "./Id/Id.js";
export const valibotSchemas = {
  collectionCategoryName,
  collectionName,
  icon,
  id,
};
export { default as extractErrorDetails } from "./extractErrorDetails.js";
export { default as isNonEmptyArray } from "./isNonEmptyArray.js";
export { default as mapNonEmptyArray } from "./mapNonEmptyArray.js";

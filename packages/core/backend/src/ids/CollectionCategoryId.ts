import * as v from "valibot";
import { idPattern } from "./_internal/idPattern.js";

type CollectionCategoryId = `CollectionCategory_${string}`;
const CollectionCategoryIdSchema = v.pipe(
  v.string(),
  v.regex(idPattern("CollectionCategory")),
) as v.GenericSchema<CollectionCategoryId, CollectionCategoryId>;
export default CollectionCategoryIdSchema;
export type { CollectionCategoryId };

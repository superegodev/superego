import * as v from "valibot";
import { idPattern } from "./_internal/idPattern.js";

type CollectionVersionId = `CollectionVersion_${string}`;
const CollectionVersionIdSchema = v.pipe(
  v.string(),
  v.regex(idPattern("CollectionVersion")),
) as v.GenericSchema<CollectionVersionId, CollectionVersionId>;
export default CollectionVersionIdSchema;
export type { CollectionVersionId };

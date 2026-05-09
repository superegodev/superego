import * as v from "valibot";
import { idPattern } from "./_internal/idPattern.js";

type CollectionId = `Collection_${string}`;
const CollectionIdSchema = v.pipe(
  v.string(),
  v.regex(idPattern("Collection")),
) as v.GenericSchema<CollectionId, CollectionId>;
export default CollectionIdSchema;
export type { CollectionId };

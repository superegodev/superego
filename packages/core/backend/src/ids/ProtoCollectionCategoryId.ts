import * as v from "valibot";
import { protoIdPattern } from "./_internal/idPattern.js";

type ProtoCollectionCategoryId = `ProtoCollectionCategory_${number}`;
const ProtoCollectionCategoryIdSchema = v.pipe(
  v.string(),
  v.regex(protoIdPattern("ProtoCollectionCategory")),
) as v.GenericSchema<ProtoCollectionCategoryId, ProtoCollectionCategoryId>;
export default ProtoCollectionCategoryIdSchema;
export type { ProtoCollectionCategoryId };

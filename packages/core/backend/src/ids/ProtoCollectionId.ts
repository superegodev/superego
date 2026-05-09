import * as v from "valibot";
import { protoIdPattern } from "./_internal/idPattern.js";

type ProtoCollectionId = `ProtoCollection_${number}`;
const ProtoCollectionIdSchema = v.pipe(
  v.string(),
  v.regex(protoIdPattern("ProtoCollection")),
) as v.GenericSchema<ProtoCollectionId, ProtoCollectionId>;
export default ProtoCollectionIdSchema;
export type { ProtoCollectionId };

import * as v from "valibot";
import { protoIdPattern } from "./_internal/idPattern.js";

type ProtoDocumentId = `ProtoDocument_${number}`;
const ProtoDocumentIdSchema = v.pipe(
  v.string(),
  v.regex(protoIdPattern("ProtoDocument")),
) as v.GenericSchema<ProtoDocumentId, ProtoDocumentId>;
export default ProtoDocumentIdSchema;
export type { ProtoDocumentId };

import * as v from "valibot";
import { protoIdPattern } from "./_internal/idPattern.js";

type ProtoAppId = `ProtoApp_${number}`;
const ProtoAppIdSchema = v.pipe(
  v.string(),
  v.regex(protoIdPattern("ProtoApp")),
) as v.GenericSchema<ProtoAppId, ProtoAppId>;
export default ProtoAppIdSchema;
export type { ProtoAppId };

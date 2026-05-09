import * as v from "valibot";
import TypescriptModuleSchema from "./TypescriptModule.js";

const RemoteConvertersSchema = v.object({
  fromRemoteDocument: TypescriptModuleSchema,
});
export default RemoteConvertersSchema;
export type RemoteConverters = v.InferOutput<typeof RemoteConvertersSchema>;

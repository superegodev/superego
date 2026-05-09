import * as v from "valibot";
import { InferenceProviderDriverSchema } from "../enums/InferenceProviderDriver.js";
import InferenceModelSchema from "./InferenceModel.js";

const InferenceProviderSchema = v.object({
  name: v.string(),
  baseUrl: v.string(),
  apiKey: v.nullable(v.string()),
  driver: InferenceProviderDriverSchema,
  models: v.array(InferenceModelSchema),
});
export default InferenceProviderSchema;
export type InferenceProvider = v.InferOutput<typeof InferenceProviderSchema>;

import * as v from "valibot";

const InferenceModelSchema = v.object({
  id: v.string(),
  name: v.string(),
  capabilities: v.object({
    audioUnderstanding: v.boolean(),
    imageUnderstanding: v.boolean(),
    pdfUnderstanding: v.boolean(),
  }),
});
export default InferenceModelSchema;
export type InferenceModel = v.InferOutput<typeof InferenceModelSchema>;

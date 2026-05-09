import * as v from "valibot";

const AudioContentSchema = v.object({
  content: v.instance(Uint8Array),
  contentType: v.string(),
});
export default AudioContentSchema;
export type AudioContent = v.InferOutput<typeof AudioContentSchema>;

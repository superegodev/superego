import * as v from "valibot";

const MessageGenerationStatsSchema = v.object({
  timeTaken: v.number(),
  inputTokens: v.number(),
  outputTokens: v.number(),
  totalTokens: v.number(),
  cost: v.optional(v.number()),
});
export default MessageGenerationStatsSchema;
export type MessageGenerationStats = v.InferOutput<
  typeof MessageGenerationStatsSchema
>;

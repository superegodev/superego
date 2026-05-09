import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import ConversationIdSchema from "../ids/ConversationId.js";

const CannotRetryLastResponseSchema = defineError(
  "CannotRetryLastResponse",
  v.object({
    conversationId: ConversationIdSchema,
    reason: v.picklist([
      "ResponseHadSideEffects",
      "ConversationHasError",
      "ConversationIsProcessing",
      "ConversationHasOutdatedContext",
    ]),
  }),
);
export default CannotRetryLastResponseSchema;
export type CannotRetryLastResponse = v.InferOutput<
  typeof CannotRetryLastResponseSchema
>;

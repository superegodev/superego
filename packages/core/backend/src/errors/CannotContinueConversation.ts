import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import ConversationIdSchema from "../ids/ConversationId.js";

const CannotContinueConversationSchema = defineError(
  "CannotContinueConversation",
  v.object({
    conversationId: ConversationIdSchema,
    reason: v.picklist([
      "ConversationIsProcessing",
      "ConversationHasError",
      "ConversationHasOutdatedContext",
    ]),
  }),
);
export default CannotContinueConversationSchema;
export type CannotContinueConversation = v.InferOutput<
  typeof CannotContinueConversationSchema
>;

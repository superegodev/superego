import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import ConversationIdSchema from "../ids/ConversationId.js";

const CannotRecoverConversationSchema = defineError(
  "CannotRecoverConversation",
  v.object({
    conversationId: ConversationIdSchema,
    reason: v.picklist([
      "ConversationIsIdle",
      "ConversationIsProcessing",
      "ConversationHasOutdatedContext",
    ]),
  }),
);
export default CannotRecoverConversationSchema;
export type CannotRecoverConversation = v.InferOutput<
  typeof CannotRecoverConversationSchema
>;
